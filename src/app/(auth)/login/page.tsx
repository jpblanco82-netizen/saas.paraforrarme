import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { signInWithMagicLink, signInWithGoogle } from "@/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; redirectedFrom?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-slate-900 dark:text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <span>MultiContent<span className="text-blue-600">.AI</span></span>
        </Link>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Transformación de contenido B2B optimizada para monetización
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Comienza tu prueba de 7 días</CardTitle>
          <CardDescription>
            Acceso instantáneo con Magic Link sin contraseñas ni formularios complejos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {params.message && (
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
              {params.message}
            </div>
          )}
          {params.error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200">
              {params.error}
            </div>
          )}

          {/* Google SSO Button */}
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="w-full py-5 font-semibold gap-2 border-slate-300 hover:bg-slate-50 dark:border-slate-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar con Google
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="bg-white px-3 text-xs uppercase text-slate-500 dark:bg-slate-900">
              o con correo corporativo
            </span>
          </div>

          {/* Magic Link Form */}
          <form action={signInWithMagicLink} className="space-y-3">
            <div className="space-y-1">
              <Input
                name="email"
                type="email"
                required
                placeholder="nombre@tuempresa.com"
                className="py-5"
              />
            </div>
            <Button type="submit" variant="gradient" className="w-full py-5 font-semibold gap-2">
              <Mail className="h-4 w-4" />
              Enviar Magic Link
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t border-slate-100 p-4 text-center text-xs text-slate-500 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Sin tarjeta requerida para los 7 días de prueba</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
