import Link from "next/link";
import { Plus, Sparkles, ArrowUpRight, Clock, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROIWidget } from "@/components/features/roi-widget";
import { checkPaywallStatus } from "@/lib/paywall";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/features/delete-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Consultar métricas de ROI
  const { data: metrics } = await supabase
    .from("metrics")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Consultar contenidos recientes
  const { data: recentContents } = await supabase
    .from("contents")
    .select("id, title, source_type, target_channels, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Consultar estado de la suscripción
  const paywallStatus = await checkPaywallStatus(user.id);

  return (
    <div className="space-y-8">
      {/* Banner de Bienvenida y Trial */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Panel de Control & ROI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Supervisa el impacto y las horas que tu equipo ha ahorrado generando contenido B2B.
          </p>
        </div>

        <Link href="/dashboard/create">
          <Button variant="gradient" size="lg" className="font-semibold gap-2 shadow-md">
            <Plus className="h-5 w-5" />
            <span>Crear Nuevo Contenido</span>
          </Button>
        </Link>
      </div>

      {/* Trial Indicator Banner */}
      {paywallStatus.planId === "free_trial" && paywallStatus.isAllowed && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                Estás disfrutando de tu prueba gratuita de 7 días
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Te quedan <strong>{paywallStatus.daysRemainingInTrial} días</strong> de acceso completo a todas las funciones Pro.
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Elegir Plan Definitivo
            </Button>
          </Link>
        </div>
      )}

      {/* Métricas de Impacto / ROI */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Impacto Económico Generado
        </h2>
        <ROIWidget
          piecesCreated={metrics?.piecesCreated ?? metrics?.pieces_created ?? 0}
          hoursSaved={Number(metrics?.hoursSaved ?? metrics?.hours_saved ?? 0)}
          estimatedRoiValue={Number(metrics?.estimatedRoiValue ?? metrics?.estimated_roi_value ?? 0)}
        />
      </div>

      {/* Contenidos Recientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Historial de Piezas Creadas
          </h2>
          <Link href="/dashboard/create" className="text-xs font-semibold text-blue-600 hover:underline">
            + Nueva transformación
          </Link>
        </div>

        {recentContents && recentContents.length > 0 ? (
          <div className="grid gap-3">
            {recentContents.map((content) => (
              <Card key={content.id} className="hover:border-slate-300 transition-all">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/content/${content.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors"
                      >
                        {content.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{formatDate(content.created_at)}</span>
                        <span>•</span>
                        <span className="capitalize">{content.source_type}</span>
                        <span>•</span>
                        <div className="flex gap-1">
                          {content.target_channels?.map((ch: string) => (
                            <span key={ch} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge
                      variant={
                        content.status === "completed"
                          ? "success"
                          : content.status === "processing"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {content.status === "completed"
                        ? "Completado"
                        : content.status === "processing"
                        ? "En Proceso"
                        : content.status}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/content/${content.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <span>Ver Piezas</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <DeleteButton contentId={content.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 border-dashed">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Aún no has generado ninguna pieza
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Comienza transformando tu primer artículo, blog post o guion en publicaciones listas para redes.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/create">
                <Button variant="gradient" className="font-semibold gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Crear mi primer contenido</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
