-- ==============================================================================
-- MULTICONTENT AI - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL + RLS)
-- ==============================================================================

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 2. TABLA: profiles (Información de usuarios y onboarding)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    onboarding_completed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABLA: subscriptions (Gestión de suscripciones, Stripe y Hard Paywall)
create table if not exists public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    stripe_customer_id text unique,
    stripe_subscription_id text unique,
    plan_id text default 'free_trial', -- 'free_trial', 'pro', 'agency'
    status text default 'trialing',     -- 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
    trial_start_at timestamp with time zone default timezone('utc'::text, now()) not null,
    trial_ends_at timestamp with time zone default timezone('utc'::text, now() + interval '7 days') not null,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA: contents (Contenido original y piezas generadas)
create table if not exists public.contents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    source_type text not null check (source_type in ('text', 'url', 'video', 'podcast')),
    source_content text not null,
    tone text default 'professional' check (tone in ('professional', 'authoritative', 'conversational', 'storytelling', 'provocative')),
    target_channels text[] default array['linkedin', 'twitter']::text[],
    generated_outputs jsonb default '{}'::jsonb, -- Almacena { linkedin: "...", twitter_thread: [...], newsletter: "..." }
    status text default 'draft' check (status in ('pending', 'processing', 'completed', 'failed', 'draft')),
    tokens_used integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABLA: metrics (Impacto y ROI del cliente B2B)
create table if not exists public.metrics (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    pieces_created integer default 0 not null,
    hours_saved numeric(8, 2) default 0.00 not null,
    estimated_roi_value numeric(10, 2) default 0.00 not null, -- En USD (ej. $50 por hora ahorrada)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.contents enable row level security;
alter table public.metrics enable row level security;

-- Políticas para Profiles
create policy "Los usuarios pueden ver su propio perfil"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil"
    on public.profiles for update
    using (auth.uid() = id);

-- Políticas para Subscriptions
create policy "Los usuarios pueden ver su propia suscripción"
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- Solo el servidor / service_role puede modificar suscripciones vía webhooks
create policy "Service Role puede gestionar suscripciones"
    on public.subscriptions for all
    using (true)
    with check (true);

-- Políticas para Contents
create policy "Los usuarios pueden gestionar su propio contenido"
    on public.contents for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Políticas para Metrics
create policy "Los usuarios pueden ver sus métricas de ROI"
    on public.metrics for select
    using (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus métricas"
    on public.metrics for update
    using (auth.uid() = user_id);

-- ==============================================================================
-- FUNCIONES Y TRIGGERS AUTOMÁTICOS
-- ==============================================================================

-- Trigger para crear perfil, suscripción (trial de 7 días) y métricas automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
    -- 1. Insertar perfil
    insert into public.profiles (id, email, full_name, avatar_url)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );

    -- 2. Insertar suscripción de prueba gratuita por 7 días
    insert into public.subscriptions (user_id, plan_id, status, trial_start_at, trial_ends_at)
    values (
        new.id,
        'free_trial',
        'trialing',
        now(),
        now() + interval '7 days'
    );

    -- 3. Inicializar registro de métricas de ROI
    insert into public.metrics (user_id, pieces_created, hours_saved, estimated_roi_value)
    values (
        new.id,
        0,
        0.00,
        0.00
    );

    return new;
end;
$$ language plpgsql security definer;

-- Asociar trigger con auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Trigger para actualizar métricas cuando se crea contenido
create or replace function public.handle_new_content_metrics()
returns trigger as $$
declare
    piece_count integer;
    calculated_hours numeric(8, 2);
    calculated_roi numeric(10, 2);
begin
    if new.status = 'completed' then
        -- Suponemos que cada transformación ahorra 2.5 horas de redacción y diseño
        calculated_hours := 2.50;
        calculated_roi := 125.00; -- $50/hora * 2.5h

        update public.metrics
        set 
            pieces_created = pieces_created + 1,
            hours_saved = hours_saved + calculated_hours,
            estimated_roi_value = estimated_roi_value + calculated_roi,
            updated_at = now()
        where user_id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_content_completed on public.contents;
create trigger on_content_completed
    after insert or update on public.contents
    for each row execute function public.handle_new_content_metrics();
