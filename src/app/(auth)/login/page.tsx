import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { signInWithMagicLink, signInWithGoogle, signInWithPassword } from "@/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; redirectedFrom?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-slate-50">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <span>MultiContent<span className="text-blue-500">.AI</span></span>
        </Link>
        <p className="mt-2 text-sm text-slate-400">
          Transformación de contenido B2B optimizada para monetización
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl bg-slate-900 border-slate-800 text-slate-100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-white">Acceso a MultiContent AI</CardTitle>
          <CardDescription className="text-slate-400">
            Inicia sesión con tu cuenta de administrador o correo corporativo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {params.message && (
            <div className="rounded-md bg-emerald-950/50 p-3 text-sm text-emerald-300 border border-emerald-800">
              {params.message}
            </div>
          )}
          {params.error && (
            <div className="rounded-md bg-red-950/50 p-3 text-sm text-red-300 border border-red-800">
              {params.error}
            </div>
          )}

          {/* Email + Password Form (Admin & Users) */}
          <form action={signInWithPassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
              <Input
                name="email"
                type="email"
                required
                defaultValue="jpblanco@outlook.es"
                placeholder="nombre@tuempresa.com"
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Contraseña</label>
              <Input
                name="password"
                type="password"
                required
                defaultValue="Jpbl@nco82"
                placeholder="••••••••"
                className="bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <Button type="submit" variant="gradient" className="w-full py-5 font-semibold gap-2 mt-2">
              <Lock className="h-4 w-4" />
              Iniciar Sesión
            </Button>
          </form>

          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t border-slate-800" />
            <span className="bg-slate-900 px-3 text-xs uppercase text-slate-500">
              o métodos rápidos
            </span>
          </div>

          {/* Google SSO Button */}
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="w-full py-4 font-semibold gap-2 border-slate-700 bg-slate-950 hover:bg-slate-800 text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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
              Google SSO
            </Button>
          </form>

          {/* Magic Link Form */}
          <form action={signInWithMagicLink} className="space-y-2">
            <Button type="submit" variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              ¿Prefieres recibir un enlace por correo? (Magic Link)
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t border-slate-800 p-4 text-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Autenticación segura cifrada con Supabase Auth</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
