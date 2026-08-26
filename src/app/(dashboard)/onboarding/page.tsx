import { redirect } from "next/navigation";
import { Sparkles, ArrowRight, Building2, User, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "@/actions/auth";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-lg shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Personaliza tu Espacio</CardTitle>
          <CardDescription>
            Solo 2 preguntas rápidas para calibrar el tono de la IA para tu negocio.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={completeOnboarding} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <User className="h-4 w-4 text-blue-600" />
                ¿Cómo te llamas?
              </label>
              <Input
                id="fullName"
                name="fullName"
                required
                defaultValue={profile?.full_name || ""}
                placeholder="Ej. Carlos Martínez"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="businessType" className="text-sm font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-blue-600" />
                ¿Cuál es tu enfoque principal de negocio?
              </label>
              <select
                id="businessType"
                name="businessType"
                required
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="saas">SaaS / Empresa Tecnológica B2B</option>
                <option value="agency">Agencia de Marketing / Contenido</option>
                <option value="consultant">Consultor / Asesor B2B</option>
                <option value="creator">Creador / Solopreneur</option>
              </select>
            </div>

            <Button type="submit" variant="gradient" className="w-full py-5 font-semibold gap-2 mt-4">
              <span>Entrar a mi Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
