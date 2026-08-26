import { Clock, TrendingUp, Sparkles, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface ROIProps {
  piecesCreated: number;
  hoursSaved: number;
  estimatedRoiValue: number;
}

export function ROIWidget({ piecesCreated, hoursSaved, estimatedRoiValue }: ROIProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Horas Ahorradas */}
      <Card className="border-l-4 border-l-blue-600 bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-900 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Horas de Trabajo Ahorradas
          </CardTitle>
          <div className="rounded-md bg-blue-100 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {hoursSaved.toFixed(1)} hrs
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Basado en un promedio de 2.5 horas por lote de contenido
          </p>
        </CardContent>
      </Card>

      {/* Piezas Creadas */}
      <Card className="border-l-4 border-l-indigo-600 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900 dark:to-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Piezas de Contenido Generadas
          </CardTitle>
          <div className="rounded-md bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {piecesCreated}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Optimizadas para LinkedIn, X y Newsletters
          </p>
        </CardContent>
      </Card>

      {/* Valor Económico / ROI Estimado */}
      <Card className="border-l-4 border-l-emerald-600 bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-900/50 sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Valor Económico Estimado (ROI)
          </CardTitle>
          <div className="rounded-md bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(estimatedRoiValue)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Estimado a $50/hora de costo equivalente de redactor B2B
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
