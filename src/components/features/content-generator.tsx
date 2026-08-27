"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, FileText, Link as LinkIcon, Radio, Video, AlertCircle, History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createAndTransformContent } from "@/actions/content";

export function ContentGenerator({ 
  isPaywallBlocked, 
  previousContents = [] 
}: { 
  isPaywallBlocked?: boolean;
  previousContents?: any[];
}) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"text" | "url" | "video" | "podcast">("text");
  const [title, setTitle] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [selectedPreviousId, setSelectedPreviousId] = useState<string>("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["linkedin", "twitter", "newsletter", "youtube", "podcast"]);
  const [selectedTone, setSelectedTone] = useState<string>("professional");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSourceTypeChange = (type: "text" | "url" | "video" | "podcast") => {
    setSourceType(type);
    let newChannels = [...selectedChannels];
    if (type === "video" && !newChannels.includes("youtube")) {
      newChannels.push("youtube");
    }
    if (type === "podcast" && !newChannels.includes("podcast")) {
      newChannels.push("podcast");
    }
    setSelectedChannels(newChannels);
  };

  const handleSelectPreviousContent = (id: string) => {
    setSelectedPreviousId(id);
    if (!id) {
      setTitle("");
      setSourceContent("");
      return;
    }

    const found = previousContents.find((c) => c.id === id);
    if (found) {
      setTitle(found.title || "");
      setSourceContent(found.source_content || "");
      if (found.source_type) setSourceType(found.source_type);
      if (found.tone) setSelectedTone(found.tone);
      if (found.target_channels && found.target_channels.length > 0) {
        setSelectedChannels(found.target_channels);
      }
    }
  };

  const handleResetForm = () => {
    setSelectedPreviousId("");
    setTitle("");
    setSourceContent("");
    setSourceType("text");
    setSelectedTone("professional");
    setSelectedChannels(["linkedin", "twitter", "newsletter"]);
  };

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPaywallBlocked) {
      setErrorMessage("Tu periodo de prueba ha concluido. Actualiza a Pro o Agencia para continuar.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("sourceContent", sourceContent);
    formData.set("sourceType", sourceType);
    formData.set("tone", selectedTone);
    selectedChannels.forEach((channel) => formData.append("targetChannels", channel));

    try {
      const result = await createAndTransformContent(formData);

      if (result.error) {
        setErrorMessage(result.message || result.error);
        setIsSubmitting(false);
      } else if (result.success && result.contentId) {
        router.push(`/dashboard/content/${result.contentId}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar la solicitud");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-slate-200 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Transformar Contenido con IA</CardTitle>
            <CardDescription>
              Convierte artículos, transcripciones o enlaces en publicaciones de alto rendimiento para redes B2B.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selector de Contenido Previo para Reutilizar */}
          {previousContents && previousContents.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950 dark:bg-blue-950/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <label htmlFor="previousContentSelect" className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                      Reutilizar contenido ya creado
                    </label>
                    <p className="text-xs text-blue-700/80 dark:text-blue-400/80">
                      Elige una pieza anterior para cargar su título y texto automáticamente
                    </p>
                  </div>
                </div>

                {selectedPreviousId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetForm}
                    className="h-7 px-2 text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300 gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Empezar en blanco</span>
                  </Button>
                )}
              </div>

              <div className="mt-3">
                <select
                  id="previousContentSelect"
                  value={selectedPreviousId}
                  onChange={(e) => handleSelectPreviousContent(e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-blue-900 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                >
                  <option value="">-- Selecciona un contenido de tu historial (opcional) --</option>
                  {previousContents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({new Date(item.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tipo de Fuente */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              1. Formato de entrada
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "text", label: "Texto / Artículo", icon: FileText },
                { id: "url", label: "Enlace Web / Blog", icon: LinkIcon },
                { id: "video", label: "YouTube / Video", icon: Video },
                { id: "podcast", label: "Podcast / Audio", icon: Radio },
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = sourceType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSourceTypeChange(type.id as any)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400 font-semibold"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título de Referencia */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              2. Título o Tema Principal
            </label>
            <Input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Guía definitiva para escalar un SaaS B2B en 2026"
            />
          </div>

          {/* Contenido Fuente */}
          <div className="space-y-2">
            <label htmlFor="sourceContent" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              3. {sourceType === "url" ? "Enlace de la publicación" : sourceType === "video" ? "Enlace del video de YouTube o guion del video" : "Pega tu contenido o transcripción aquí"}
            </label>
            <Textarea
              id="sourceContent"
              name="sourceContent"
              required
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              rows={sourceType === "url" || sourceType === "video" ? 3 : 6}
              placeholder={
                sourceType === "url"
                  ? "https://tuempresa.com/blog/como-escalar-ventas-b2b"
                  : sourceType === "video"
                  ? "https://www.youtube.com/watch?v=... o pega el guion / notas del video"
                  : "Pega el texto de tu artículo, notas de episodio o transcripción..."
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tono de Voz */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                4. Tono de Comunicación
              </label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="professional">Profesional & Estratégico (B2B)</option>
                <option value="authoritative">Autoridad / Líder de Opinión</option>
                <option value="conversational">Cercano & Conversacional</option>
                <option value="storytelling">Storytelling & Lecciones</option>
                <option value="provocative">Disruptivo & Provocador</option>
              </select>
            </div>

            {/* Canales Objetivo */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                5. Canales a Generar
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "linkedin", label: "LinkedIn Post" },
                  { id: "twitter", label: "Hilo de X (Twitter)" },
                  { id: "newsletter", label: "Newsletter Semanal" },
                  { id: "youtube", label: "Video YouTube & Shorts" },
                  { id: "podcast", label: "Podcast (Audio a 2 voces)" },
                ].map((channel) => {
                  const isChecked = selectedChannels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                        isChecked
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="h-3 w-3" />}
                      {channel.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-xs text-slate-500">
            ⚡ Procesamiento asíncrono optimizado con Gemini 1.5 Pro & GPT-4o
          </p>
          <Button
            type="submit"
            size="lg"
            variant="gradient"
            disabled={isSubmitting}
            className="w-full sm:w-auto font-semibold gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Generando piezas con IA...</span>
              </>
            ) : (
              <>
                <span>Generar Contenido</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
