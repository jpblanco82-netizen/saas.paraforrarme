"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("jpblanco@outlook.es");
  const [password, setPassword] = useState("Jpbl@nco82");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Credenciales incorrectas. Verifica tu correo y contraseña."
            : error.message
        );
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Redirección exitosa
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al conectar con el servidor");
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setErrorMessage("Por favor ingresa un correo para el Magic Link");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al enviar enlace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Error al conectar con Google");
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/60 p-3 text-sm text-red-300 border border-red-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {magicLinkSent && (
        <div className="rounded-lg bg-emerald-950/60 p-3 text-sm text-emerald-300 border border-emerald-800 animate-in fade-in">
          ¡Enlace de acceso enviado a <strong>{email}</strong>! Revisa tu bandeja.
        </div>
      )}

      <form onSubmit={handlePasswordLogin} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@tuempresa.com"
            className="bg-slate-950 border-slate-700 text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Contraseña</label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-slate-950 border-slate-700 text-white"
          />
        </div>

        <Button
          type="submit"
          variant="gradient"
          disabled={isLoading}
          className="w-full py-5 font-semibold gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Iniciar Sesión</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative flex items-center justify-center py-1">
        <div className="w-full border-t border-slate-800" />
        <span className="bg-slate-900 px-3 text-xs uppercase text-slate-500">
          o métodos rápidos
        </span>
      </div>

      {/* Google SSO */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
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
        <span>Continuar con Google</span>
      </Button>

      {/* Magic Link */}
      <Button
        type="button"
        variant="ghost"
        onClick={handleMagicLink}
        disabled={isLoading}
        className="w-full text-xs text-slate-400 hover:text-white gap-1.5"
      >
        <Mail className="h-3.5 w-3.5" />
        <span>Enviar Magic Link por correo</span>
      </Button>
    </div>
  );
}
