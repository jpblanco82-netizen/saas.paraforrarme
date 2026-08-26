import { redirect } from "next/navigation";
import { Check, CreditCard, Sparkles, ShieldCheck, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession, createCustomerPortalSession } from "@/actions/stripe";
import { checkPaywallStatus } from "@/lib/paywall";
import { formatDate } from "@/lib/utils";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const paywallStatus = await checkPaywallStatus(user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Suscripción & Facturación
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Gestiona tu plan actual, métodos de pago y facturas de Stripe.
        </p>
      </div>

      {/* Estado Actual */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold">Estado de tu Cuenta</CardTitle>
              <Badge
                variant={
                  subscription?.status === "active"
                    ? "success"
                    : subscription?.status === "trialing"
                    ? "warning"
                    : "destructive"
                }
              >
                {subscription?.status === "active"
                  ? `Plan ${subscription?.plan_id?.toUpperCase()} Activo`
                  : subscription?.status === "trialing"
                  ? "Prueba Gratuita (7 Días)"
                  : "Suscripción Inactiva"}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              {subscription?.plan_id === "free_trial" && subscription?.trial_ends_at ? (
                <>
                  Tu periodo de prueba finaliza el{" "}
                  <strong>{formatDate(subscription.trial_ends_at)}</strong> (
                  {paywallStatus.daysRemainingInTrial ?? 0} días restantes).
                </>
              ) : subscription?.current_period_end ? (
                <>
                  Tu suscripción se renovará automáticamente el{" "}
                  <strong>{formatDate(subscription.current_period_end)}</strong>.
                </>
              ) : (
                "Acceso gestionado por el motor de Muro de Pago."
              )}
            </CardDescription>
          </div>

          {subscription?.stripe_customer_id && (
            <form action={createCustomerPortalSession}>
              <Button variant="outline" type="submit" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Portal de Facturación Stripe</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </form>
          )}
        </CardHeader>
      </Card>

      {/* Planes de Suscripción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Plan PRO */}
        <Card className={`flex flex-col ${subscription?.plan_id === "pro" ? "border-2 border-blue-600 shadow-md" : "border-slate-200 dark:border-slate-800"}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">Plan Profesional</CardTitle>
              {subscription?.plan_id === "pro" && <Badge variant="default">Tu Plan Actual</Badge>}
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$29</span>
              <span className="ml-1 text-sm font-semibold text-slate-500">/mes</span>
            </div>
            <CardDescription className="mt-2">
              Para profesionales individuales, creadores y fundadores B2B.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Generaciones ilimitadas para LinkedIn y X</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Formato de Newsletter Semanal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Métricas completas de ROI y horas</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <form action={() => createCheckoutSession("pro")} className="w-full">
              <Button
                type="submit"
                className="w-full"
                variant={subscription?.plan_id === "pro" ? "outline" : "default"}
                disabled={subscription?.plan_id === "pro"}
              >
                {subscription?.plan_id === "pro" ? "Plan Activo" : "Seleccionar Plan Pro ($29/mes)"}
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Plan AGENCY */}
        <Card className={`flex flex-col bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/20 ${subscription?.plan_id === "agency" ? "border-2 border-blue-600 shadow-md" : "border-2 border-blue-500/50"}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">Plan Agencia / Multi-Marca</CardTitle>
              {subscription?.plan_id === "agency" ? (
                <Badge variant="default">Tu Plan Actual</Badge>
              ) : (
                <Badge className="bg-blue-600 text-white">Recomendado Equipos</Badge>
              )}
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$79</span>
              <span className="ml-1 text-sm font-semibold text-slate-500">/mes</span>
            </div>
            <CardDescription className="mt-2">
              Para agencias de marketing y equipos que manejan múltiples marcas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-medium">Todo lo incluido en el Plan Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Múltiples perfiles de marca y personalidades</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Acceso a API y colas de máxima prioridad</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Soporte prioritario 24/7 y Onboarding asistido</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <form action={() => createCheckoutSession("agency")} className="w-full">
              <Button
                type="submit"
                variant="gradient"
                className="w-full font-semibold"
                disabled={subscription?.plan_id === "agency"}
              >
                {subscription?.plan_id === "agency" ? "Plan Activo" : "Seleccionar Plan Agencia ($79/mes)"}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
