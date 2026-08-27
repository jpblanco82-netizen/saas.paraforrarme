import { createClient } from "@/lib/supabase/server";
import { ContentGenerator } from "@/components/features/content-generator";
import { checkPaywallStatus } from "@/lib/paywall";

export default async function CreateContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const paywallStatus = await checkPaywallStatus(user.id);

  // Consultar contenidos previos para permitir reutilización
  const { data: previousContents } = await supabase
    .from("contents")
    .select("id, title, source_type, source_content, tone, target_channels, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Crear Nuevo Lote de Contenido
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Ingresa nuevo contenido original o selecciona una pieza existente para retransformarla.
        </p>
      </div>

      <ContentGenerator 
        isPaywallBlocked={!paywallStatus.isAllowed} 
        previousContents={previousContents || []}
      />
    </div>
  );
}
