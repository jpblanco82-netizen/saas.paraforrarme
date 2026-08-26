"use client";

import { useState } from "react";
import { Lock, Mail, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("jpblanco@outlook.es");
  const [password, setPassword] = useState("Jpbl@nco82");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      // Redirección directa y limpia al Dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMessage(err.message || "Error al conectar con el servidor");
      setIsLoading(false);
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
    </div>
  );
}
