import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Share2,
  Lightbulb,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Header del Manual */}
      <div className="space-y-3">
        <Badge variant="outline" className="border-blue-500/40 text-blue-400 gap-1.5 py-1 px-3">
          <BookOpen className="h-3.5 w-3.5" />
          Documentación & Guía Estratégica
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Manual de Uso: Cómo Escalar tu Presencia B2B con MultiContent AI
        </h1>
        <p className="text-slate-400 text-base max-w-3xl leading-relaxed">
          Aprende a transformar una sola pieza de contenido largo en un sistema de distribución multicanal
          de alto impacto, ahorrando +15 horas semanales y multiplicando el alcance de tu marca.
        </p>
      </div>

      {/* Flujo en 4 Pasos */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-500" />
          El Flujo de Trabajo en 4 Pasos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paso 1 */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-sm">
                1
              </span>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">Entrada</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">Introduce tu Contenido Fuente</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Puedes ingresar contenido en 4 modalidades:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <strong>Texto Libre:</strong> Artículos de blog, notas, ensayos o transcripciones.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <strong>Enlace Web (URL):</strong> Pega la URL de tu blog o publicación externa.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <strong>Videos / Podcasts:</strong> Pega el guion o transcripción del episodio.
              </li>
            </ul>
          </Card>

          {/* Paso 2 */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-sm">
                2
              </span>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">Calibración</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">Elige Tono y Canales Objetivo</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Personaliza cómo debe hablar la IA según tu posicionamiento:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <strong>Profesional & Estratégico:</strong> Ideal para ventas B2B y SaaS.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <strong>Autoridad / Líder de Opinión:</strong> Para fundadores y ejecutivos.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <strong>Storytelling:</strong> Conexión emocional y lecciones de experiencia.
              </li>
            </ul>
          </Card>

          {/* Paso 3 */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 font-bold text-white text-sm">
                3
              </span>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">Generación</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">Revisión y Edición en 1 Clic</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              La IA genera simultáneamente todas las versiones optimizadas:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <strong>Post para LinkedIn:</strong> Con ganchos de retención y CTA al final.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <strong>Hilo de X (Twitter):</strong> Secuencia de 3 a 5 tweets conectados.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <strong>Newsletter:</strong> Asunto de alta apertura, preheader y cuerpo.
              </li>
            </ul>
          </Card>

          {/* Paso 4 */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-sm">
                4
              </span>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">Impacto</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">Medición Automática de ROI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cada generación suma métricas a tu panel de control:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <strong>2.5 horas ahorradas</strong> estimadas por cada lote de contenido.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <strong>$125 USD de valor económico</strong> generado (a $50/hora de redactor).
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Historial persistente para volver a copiar o editar en cualquier momento.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Mejores Prácticas por Red Social */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-indigo-400" />
          Fórmulas y Mejores Prácticas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 p-5 space-y-3">
            <div className="font-bold text-blue-400 flex items-center gap-2">
              <span className="rounded bg-blue-950 p-1.5">in</span>
              <span>LinkedIn B2B</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              • <strong>Las 2 primeras líneas:</strong> Son el 80% del éxito (el botón "ver más").
              <br />• <strong>Espaciado:</strong> Máximo 2 oraciones por párrafo para lectura móvil.
              <br />• <strong>Pregunta final:</strong> Invita a debate profesional para activar el algoritmo.
            </p>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-5 space-y-3">
            <div className="font-bold text-indigo-400 flex items-center gap-2">
              <span className="rounded bg-indigo-950 p-1.5 font-mono">𝕏</span>
              <span>Hilos de X (Twitter)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              • <strong>Tweet 1 (Gancho):</strong> Promesa clara o estadística contundente.
              <br />• <strong>Tweets intermedios:</strong> Una idea accionable por tweet.
              <br />• <strong>Tweet final:</strong> Llamada a retweet y suscripción a tu perfil.
            </p>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-5 space-y-3">
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Newsletter Semanal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              • <strong>Asunto corto:</strong> Menos de 45 caracteres para evitar cortes en móvil.
              <br />• <strong>Preheader complementario:</strong> Despierta curiosidad inmediata.
              <br />• <strong>Estructura escaneable:</strong> Viñetas y conclusiones directas.
            </p>
          </Card>
        </div>
      </div>

      {/* Muro de Pago y Monetización */}
      <Card className="bg-gradient-to-br from-slate-900 to-blue-950/40 border-blue-600/30 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Monetización y Muro de Pago (Paywall)</h3>
            <p className="text-slate-400 text-sm">
              Cómo funciona el modelo de monetización de MultiContent AI.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="rounded-lg bg-slate-950/60 p-4 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              Prueba Gratuita de 7 Días
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cada nuevo usuario registrado obtiene 7 días de acceso completo a todas las funciones sin necesidad de introducir tarjeta de crédito al inicio.
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-4 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              Planes Pro ($29) y Agencia ($79)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Al terminar la prueba, el Muro de Pago bloquea la generación hasta seleccionar un plan mensual gestionado de forma 100% segura mediante Stripe.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            ¿Listo para ponerlo en práctica con tu primer contenido?
          </p>
          <Link href="/dashboard/create">
            <Button variant="gradient" className="gap-2 font-semibold shadow-md">
              <span>Crear Nuevo Contenido Ahora</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
