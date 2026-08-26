import Link from "next/link";
import { Sparkles, ArrowRight, Check, Zap, Shield, Clock, TrendingUp, Mail, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-blue-600 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <span>MultiContent<span className="text-blue-500">.AI</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/login">
              <Button size="sm" variant="gradient" className="font-semibold shadow-md">
                Prueba Gratis 7 Días
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))]" />
          
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            <Badge variant="outline" className="border-blue-500/40 text-blue-400 py-1 px-3 text-xs gap-1.5 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Micro-SaaS B2B para Generación y Distribución
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Convierte un solo artículo en <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">10+ piezas de contenido</span> de alto impacto.
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
              La plataforma de IA para fundadores, agencias y equipos B2B que transforma podcasts, blogs y enlaces en publicaciones listas para monetizar en LinkedIn, X y Newsletters.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="gradient" className="w-full font-bold text-base py-6 px-8 shadow-xl shadow-blue-600/20 gap-2">
                  <span>Comenzar Prueba Gratuita (7 Días)</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full py-6 px-6 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200">
                  Ver Planes & Precios
                </Button>
              </a>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Sin tarjeta de crédito inicial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Modelos Gemini 1.5 Pro & GPT-4o</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-20 bg-slate-900/50 border-y border-slate-800/80">
          <div className="container mx-auto px-4 max-w-6xl space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Diseñado para ahorrarte +15 horas cada semana
              </h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                Optimiza todo tu embudo de distribución orgánica sin redactores adicionales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  in
                </div>
                <h3 className="text-xl font-bold text-white">Post de LinkedIn Virales</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Ganchos diseñados con fórmulas probadas de retención, formato legible para el feed y llamadas a la acción que multiplican los leads B2B.
                </p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  𝕏
                </div>
                <h3 className="text-xl font-bold text-white">Hilos de X (Twitter)</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Desgloses tweet a tweet con frameworks accionables que generan retweets y seguidores calificados de tu sector industrial.
                </p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Newsletters Semanales</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Asuntos de alta apertura con preheaders intrigantes y resúmenes estructurados listos para enviar a tu lista de suscriptores.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section (Hard Paywall) */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 max-w-5xl space-y-12">
            <div className="text-center space-y-3">
              <Badge variant="outline" className="border-blue-500/40 text-blue-400">
                Precios Transparentes
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Planes adaptados a tu ritmo de crecimiento
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-base">
                Prueba 7 días gratis. Tras la prueba, accede a través de nuestro Muro de Pago sin suscripciones ocultas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plan Pro */}
              <Card className="bg-slate-900 border-slate-800 flex flex-col p-6 hover:border-slate-700 transition-all">
                <CardHeader className="p-0 pb-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold text-white">Plan Profesional</CardTitle>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">Popular</Badge>
                  </div>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">$29</span>
                    <span className="ml-2 text-slate-400">/mes</span>
                  </div>
                  <CardDescription className="text-slate-400 mt-2">
                    Para consultores, fundadores individuales y creadores B2B.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-4 flex-1 space-y-3">
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Generación ilimitada para LinkedIn y X</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Formato de Newsletter Semanal completo</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Panel de ROI & cálculo de horas ahorradas</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Modelos Gemini 1.5 Pro & GPT-4o</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="p-0 pt-6">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full py-5 font-semibold border-slate-700 hover:bg-slate-800 text-white">
                      Comenzar Prueba Gratuita
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Plan Agency */}
              <Card className="bg-gradient-to-b from-blue-950/40 to-slate-900 border-2 border-blue-600 flex flex-col p-6 shadow-xl shadow-blue-600/10">
                <CardHeader className="p-0 pb-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold text-white">Plan Agencia</CardTitle>
                    <Badge className="bg-blue-600 text-white">Más Potente</Badge>
                  </div>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">$79</span>
                    <span className="ml-2 text-slate-400">/mes</span>
                  </div>
                  <CardDescription className="text-slate-400 mt-2">
                    Para agencias y equipos que gestionan múltiples clientes.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-4 flex-1 space-y-3">
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      <span className="font-semibold text-white">Todo lo del Plan Pro</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Múltiples perfiles de marca y tonos personalizados</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Acceso a API y Colas de ultra-alta velocidad</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Soporte prioritario y gestor de cuenta dedicado</span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter className="p-0 pt-6">
                  <Link href="/login" className="w-full">
                    <Button variant="gradient" className="w-full py-5 font-semibold">
                      Comenzar Prueba Gratuita
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>© 2026 MultiContent AI. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-slate-400">Términos</Link>
            <Link href="/login" className="hover:text-slate-400">Privacidad</Link>
            <Link href="/login" className="hover:text-slate-400">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
