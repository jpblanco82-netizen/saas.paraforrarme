import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LoginForm } from "@/components/features/login-form";

export default function LoginPage() {
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

        <CardContent>
          <LoginForm />
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
