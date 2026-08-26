"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
});

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;
  const validation = emailSchema.safeParse({ email });

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "¡Enlace mágico enviado! Revisa tu bandeja de entrada." };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

const onboardingSchema = z.object({
  fullName: z.string().min(2, "El nombre es obligatorio"),
  businessType: z.string().min(2, "Selecciona tu tipo de negocio"),
});

export async function completeOnboarding(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const businessType = formData.get("businessType") as string;

  const validation = onboardingSchema.safeParse({ fullName, businessType });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "No se pudo completar el onboarding" };
  }

  redirect("/dashboard");
}
