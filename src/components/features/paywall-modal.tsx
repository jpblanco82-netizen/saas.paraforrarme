"use client";

import { useState } from "react";
import { Lock, Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession } from "@/actions/stripe";

export function PaywallModal({
  reason = "trial_expired",
  trialEndsAt,
}: {
  reason?: "trial_expired" | "no_subscription";
  trialEndsAt?: string;
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "pro" | "agency") => {
    setLoadingPlan(plan);
    try {
      await createCheckoutSession(plan);
    } catch (e) {
      console.error(e);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {reason === "trial_expired"
              ? "Tu prueba gratuita de 7 días ha finalizado"
              : "Desbloquea el acceso ilimitado a MultiContent AI"}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Para continuar generando contenido de alto impacto, ahorrar más de 10 horas semanales y acceder a los modelos avanzados de IA, selecciona un plan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Plan PRO */}
          <Card className="relative flex flex-col border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Plan Profesional</CardTitle>
                <Badge variant="secondary">Más Popular</Badge>
              </div>
              <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                <span className="text-4xl font-extrabold tracking-tight">$29</span>
                <span className="ml-1 text-sm font-semibold text-slate-500">/mes</span>
              </div>
              <CardDescription className="mt-2">
                Ideal para creadores, consultores y fundadores de startups.
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
                  <span>Formato completo de Newsletters semanales</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Modelos de IA de alta precisión</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Panel de ROI y horas ahorradas</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubscribe("pro")}
                disabled={loadingPlan !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5"
              >
                {loadingPlan === "pro" ? "Conectando con Stripe..." : "Comenzar con Plan Pro"}
              </Button>
            </CardFooter>
          </Card>

          {/* Plan AGENCY */}
          <Card className="relative flex flex-col border-2 border-blue-600 dark:border-blue-500 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 shadow-md">
            <div className="absolute -top-3 right-6">
              <Badge className="bg-blue-600 text-white hover:bg-blue-600 flex gap-1 items-center">
                <Sparkles className="h-3 w-3" /> Potencia Máxima
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Plan Agencia / Multi-Marca</CardTitle>
              <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                <span className="text-4xl font-extrabold tracking-tight">$79</span>
                <span className="ml-1 text-sm font-semibold text-slate-500">/mes</span>
              </div>
              <CardDescription className="mt-2">
                Para agencias y equipos que gestionan múltiples marcas o clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-900 dark:text-white">Todo lo incluido en el Plan Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Múltiples perfiles y tonos de marca</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Integración de Webhooks y API Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Soporte prioritario y Gestor de Cuenta</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubscribe("agency")}
                disabled={loadingPlan !== null}
                variant="gradient"
                className="w-full font-semibold py-5"
              >
                {loadingPlan === "agency" ? "Conectando con Stripe..." : "Adquirir Plan Agencia"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Pago 100% seguro procesado por Stripe. Cancela en cualquier momento.</span>
          </div>
          <span>Garantía de reembolso de 14 días</span>
        </div>
      </div>
    </div>
  );
}
