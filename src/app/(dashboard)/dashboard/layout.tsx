import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { checkPaywallStatus } from "@/lib/paywall";
import { PaywallModal } from "@/components/features/paywall-modal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar si necesita onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // Verificar estado del Muro de Pago
  const paywallStatus = await checkPaywallStatus(user.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <DashboardNav userEmail={user.email} />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-8">
        {/* Si el paywall está bloqueado (trial expirado o sin suscripción activa), mostrar modal bloqueante */}
        {!paywallStatus.isAllowed && (
          <PaywallModal
            reason={paywallStatus.reason === "no_subscription" ? "no_subscription" : "trial_expired"}
            trialEndsAt={paywallStatus.trialEndsAt}
          />
        )}

        {children}
      </main>
    </div>
  );
}
