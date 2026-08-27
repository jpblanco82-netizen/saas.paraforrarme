"use client";

import { useState } from "react";
import { Copy, Check, Save, Mail, Sparkles, Share2, ExternalLink, Send, Zap, Loader2, Video, Play, Film, Clock, Tag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateContentOutput } from "@/actions/content";
import { publishDirectToLinkedIn } from "@/actions/linkedin";
import { publishDirectToNodalio } from "@/actions/nodalio";

export function ContentEditor({ content }: { content: any }) {
  const [activeTab, setActiveTab] = useState<"linkedin" | "twitter" | "newsletter" | "youtube">(
    content.generated_outputs?.youtube_video ? "youtube" : "linkedin"
  );
  const [outputs, setOutputs] = useState(content.generated_outputs || {});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPublishingLinkedIn, setIsPublishingLinkedIn] = useState(false);
  const [isPublishingYouTube, setIsPublishingYouTube] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
    url?: string;
  } | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Publicación 100% Automática vía API
  const handleAutoPublishLinkedIn = async () => {
    if (!outputs.linkedin) return;
    
    // Ventana de confirmación de seguridad
    const confirmPublish = window.confirm("¿Estás seguro de que quieres publicar este texto directamente en tu muro de LinkedIn ahora mismo?");
    if (!confirmPublish) return;

    setIsPublishingLinkedIn(true);
    setPublishStatus(null);

    try {
      const res = await publishDirectToLinkedIn(content.id, outputs.linkedin);

      if (res.success) {
        setPublishStatus({
          type: "success",
          message: "¡Publicado automáticamente en tu perfil de LinkedIn!",
          url: res.postUrl || "https://www.linkedin.com/feed/",
        });
      } else {
        setPublishStatus({
          type: "error",
          message: res.message || "No se pudo completar la publicación automática",
          url: res.postUrl,
        });
      }
    } catch (e: any) {
      setPublishStatus({
        type: "error",
        message: e.message || "Error al conectar con LinkedIn",
      });
    } finally {
      setIsPublishingLinkedIn(false);
    }
  };

  // 1.5. Publicación 100% Automática en Nodalio
  const handlePublishToNodalio = async () => {
    if (!outputs.newsletter || !outputs.newsletter.subject || !outputs.newsletter.body) return;
    
    const confirmPublish = window.confirm("¿Estás seguro de que quieres publicar este artículo en el blog de Nodalio ahora mismo?");
    if (!confirmPublish) return;

    setIsPublishingLinkedIn(true); // Reusamos el estado de carga
    setPublishStatus(null);

    try {
      const res = await publishDirectToNodalio(outputs.newsletter.subject, outputs.newsletter.body);

      if (res.success) {
        setPublishStatus({
          type: "success",
          message: "¡Artículo publicado automáticamente en el blog de Nodalio!",
          url: res.url,
        });
      } else {
        setPublishStatus({
          type: "error",
          message: res.message || "No se pudo publicar en Nodalio",
        });
      }
    } catch (e: any) {
      setPublishStatus({
        type: "error",
        message: e.message || "Error al conectar con Nodalio",
      });
    } finally {
      setIsPublishingLinkedIn(false);
    }
  };

  // 1.8. Crear Borrador Automático en YouTube Studio
  const handleCreateYouTubeDraft = async () => {
    if (!outputs.youtube_video) return;
    
    const confirmPublish = window.confirm("Esto generará una miniatura con IA y creará un video borrador privado en tu YouTube Studio. ¿Continuar?");
    if (!confirmPublish) return;

    setIsPublishingYouTube(true);
    setPublishStatus(null);

    try {
      // Importamos la acción de forma dinámica para evitar problemas en el cliente si no es necesario
      const { createYouTubeDraft } = await import("@/actions/youtube");
      
      const res = await createYouTubeDraft(
        outputs.youtube_video.title,
        outputs.youtube_video.description,
        outputs.youtube_video.tags || [],
        outputs.youtube_video.thumbnail_prompt
      );

      if (res.success) {
        setPublishStatus({
          type: "success",
          message: "¡Borrador creado en YouTube Studio! Ya puedes subir tu archivo de video final.",
          url: res.studioUrl,
        });
      } else {
        setPublishStatus({
          type: "error",
          message: res.message || "No se pudo crear el borrador en YouTube",
        });
      }
    } catch (e: any) {
      setPublishStatus({
        type: "error",
        message: e.message || "Error al conectar con YouTube",
      });
    } finally {
      setIsPublishingYouTube(false);
    }
  };

  // 2. Abrir compositor nativo con texto en portapapeles
  const handleOpenLinkedInComposer = () => {
    if (!outputs.linkedin) return;
    navigator.clipboard.writeText(outputs.linkedin);
    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");

    setPublishStatus({
      type: "info",
      message: "¡Texto copiado al portapapeles! En LinkedIn pulsa Ctrl + V para pegar.",
      url: "https://www.linkedin.com/feed/",
    });
  };

  const handlePublishToTwitter = () => {
    if (!outputs.twitter_thread || outputs.twitter_thread.length === 0) return;
    const firstTweet = outputs.twitter_thread[0];
    const encoded = encodeURIComponent(firstTweet);
    navigator.clipboard.writeText(outputs.twitter_thread.join("\n\n---\n\n"));
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");

    setPublishStatus({
      type: "info",
      message: "¡Hilo copiado! Ventana de X (Twitter) abierta.",
      url: "https://twitter.com",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateContentOutput(content.id, outputs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLinkedIn = (val: string) => {
    setOutputs({ ...outputs, linkedin: val });
  };

  const updateTweet = (index: number, val: string) => {
    const newThread = [...(outputs.twitter_thread || [])];
    newThread[index] = val;
    setOutputs({ ...outputs, twitter_thread: newThread });
  };

  const updateNewsletter = (field: string, val: string) => {
    setOutputs({
      ...outputs,
      newsletter: {
        ...(outputs.newsletter || {}),
        [field]: val,
      },
    });
  };

  const updateYouTubeField = (field: string, val: any) => {
    setOutputs({
      ...outputs,
      youtube_video: {
        ...(outputs.youtube_video || {}),
        [field]: val,
      },
    });
  };

  const updateScene = (idx: number, field: string, val: any) => {
    const scenes = [...(outputs.youtube_video?.script_scenes || [])];
    if (scenes[idx]) {
      scenes[idx] = { ...scenes[idx], [field]: val };
      updateYouTubeField("script_scenes", scenes);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Estado de Publicación */}
      {publishStatus && (
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl p-4 text-sm shadow-xl animate-in fade-in ${
            publishStatus.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border border-emerald-700"
              : publishStatus.type === "error"
              ? "bg-red-950/90 text-red-200 border border-red-700"
              : "bg-blue-950/90 text-blue-200 border border-blue-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {publishStatus.type === "success" && <Check className="h-5 w-5 text-emerald-400 shrink-0" />}
            {publishStatus.type === "info" && <Zap className="h-5 w-5 text-blue-400 shrink-0" />}
            <span>{publishStatus.message}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {publishStatus.url && publishStatus.url.includes("/api/auth/linkedin") ? (
              <a
                href={publishStatus.url}
                className="text-xs underline hover:text-white flex items-center gap-1 font-semibold bg-blue-600 px-3 py-1.5 rounded-md no-underline"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Conectar mi cuenta de LinkedIn</span>
              </a>
            ) : publishStatus.url ? (
              <a
                href={publishStatus.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>{publishStatus.url.includes("localhost:3001") || publishStatus.url.includes("nodalio") ? "Ver en Nodalio" : "Ver en LinkedIn"}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPublishStatus(null)}
              className="h-7 text-xs hover:bg-white/10"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Selector de Pestañas y Acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          {outputs.linkedin && (
            <Button
              type="button"
              variant={activeTab === "linkedin" ? "default" : "outline"}
              onClick={() => setActiveTab("linkedin")}
              className="gap-2"
            >
              <span className="font-bold text-[#0A66C2]">in</span>
              <span>Post LinkedIn</span>
            </Button>
          )}

          {outputs.twitter_thread && (
            <Button
              type="button"
              variant={activeTab === "twitter" ? "default" : "outline"}
              onClick={() => setActiveTab("twitter")}
              className="gap-2"
            >
              <span className="font-bold">𝕏</span>
              <span>Hilo de X (Twitter)</span>
            </Button>
          )}

          {outputs.newsletter && (
            <Button
              type="button"
              variant={activeTab === "newsletter" ? "default" : "outline"}
              onClick={() => setActiveTab("newsletter")}
              className="gap-2"
            >
              <Mail className="h-4 w-4 text-emerald-400" />
              <span>Newsletter</span>
            </Button>
          )}

          {outputs.youtube_video && (
            <Button
              type="button"
              variant={activeTab === "youtube" ? "default" : "outline"}
              onClick={() => setActiveTab("youtube")}
              className={`gap-2 ${activeTab === "youtube" ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-900/50 text-red-400 hover:bg-red-950/40"}`}
            >
              <Video className="h-4 w-4 text-red-500" />
              <span>YouTube & Video</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            variant="outline"
            className="gap-1.5 border-slate-700 hover:bg-slate-800 text-white"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Vista de LinkedIn con Publicador Automático */}
      {activeTab === "linkedin" && outputs.linkedin && (
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#0A66C2]/20 p-2.5 text-[#0A66C2] font-bold text-lg border border-[#0A66C2]/40">
                in
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">Publicación para LinkedIn</CardTitle>
                <CardDescription className="text-slate-400">
                  Formato optimizado con ganchos de retención y debate profesional
                </CardDescription>
              </div>
            </div>

            {/* Botones de Acción de LinkedIn */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(outputs.linkedin, "linkedin")}
                className="gap-1.5 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
              >
                {copiedKey === "linkedin" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenLinkedInComposer}
                title="Abre la ventana de LinkedIn con el texto copiado para pegar con Ctrl + V"
                className="gap-1.5 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Abrir en LinkedIn</span>
              </Button>

              {/* Botón de Publicación 100% Automática */}
              <Button
                size="sm"
                disabled={isPublishingLinkedIn}
                onClick={handleAutoPublishLinkedIn}
                className="gap-2 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold shadow-lg shadow-blue-900/40"
              >
                {isPublishingLinkedIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publicar Automáticamente</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <Textarea
              rows={14}
              value={outputs.linkedin}
              onChange={(e) => updateLinkedIn(e.target.value)}
              className="font-sans text-sm leading-relaxed p-4 bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500 rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Vista de Twitter / X Thread */}
      {activeTab === "twitter" && outputs.twitter_thread && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-sm">𝕏</span>
              <span>Hilo de {outputs.twitter_thread.length} Tweets</span>
            </h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(outputs.twitter_thread.join("\n\n---\n\n"), "all_tweets")}
                className="gap-1.5 border-slate-700 bg-slate-950 text-slate-200"
              >
                {copiedKey === "all_tweets" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Todo</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={handlePublishToTwitter}
                className="gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700"
              >
                <Send className="h-4 w-4" />
                <span>Publicar en X</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </div>
          </div>

          {outputs.twitter_thread.map((tweet: string, idx: number) => (
            <Card key={idx} className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between py-2.5 px-4 bg-slate-950/60 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400">
                  Tweet #{idx + 1}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(tweet, `tweet_${idx}`)}
                  className="h-7 px-2 text-xs gap-1 text-slate-400 hover:text-white"
                >
                  {copiedKey === `tweet_${idx}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="p-3">
                <Textarea
                  rows={3}
                  value={tweet}
                  onChange={(e) => updateTweet(idx, e.target.value)}
                  className="text-sm font-sans bg-slate-950 border-slate-800 text-slate-100"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de Newsletter */}
      {activeTab === "newsletter" && outputs.newsletter && (
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-950 p-2 text-emerald-400 border border-emerald-900">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">Edición para Newsletter</CardTitle>
                <CardDescription className="text-slate-400">
                  Estructurada para alta tasa de apertura y lectura completa
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleCopy(
                    `Asunto: ${outputs.newsletter.subject}\n\nPreheader: ${outputs.newsletter.preview}\n\n${outputs.newsletter.body}`,
                    "newsletter_all"
                  )
                }
                className="gap-1.5 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
              >
                {copiedKey === "newsletter_all" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Newsletter</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                disabled={isPublishingLinkedIn}
                onClick={handlePublishToNodalio}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-900/40"
              >
                {isPublishingLinkedIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publicar en Nodalio</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Asunto (Subject):</label>
              <input
                type="text"
                value={outputs.newsletter.subject || ""}
                onChange={(e) => updateNewsletter("subject", e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-medium text-white focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Preheader / Preview:</label>
              <input
                type="text"
                value={outputs.newsletter.preview || ""}
                onChange={(e) => updateNewsletter("preview", e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Cuerpo del Email:</label>
              <Textarea
                rows={12}
                value={outputs.newsletter.body || ""}
                onChange={(e) => updateNewsletter("body", e.target.value)}
                className="font-sans text-sm leading-relaxed p-4 bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de Video de YouTube / Shorts */}
      {activeTab === "youtube" && outputs.youtube_video && (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-red-950/80 text-slate-100 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800 bg-gradient-to-r from-red-950/30 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-600/20 p-2.5 text-red-500 font-bold text-lg border border-red-600/40 flex items-center justify-center">
                  <Play className="h-5 w-5 fill-red-500 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <span>Estudio de Producción de Video & YouTube</span>
                    <span className="rounded-full bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 text-[11px] font-semibold">
                      {outputs.youtube_video.script_scenes?.reduce((acc: number, s: any) => acc + (Number(s.duration_sec) || 0), 0) || 60}s aprox.
                    </span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Guion técnico estructurado por escenas, B-Rolls, locución y metadatos SEO
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCopy(
                      outputs.youtube_video.full_script_teleprompter ||
                        outputs.youtube_video.script_scenes?.map((s: any) => `[ESCENA ${s.scene_number} - ${s.duration_sec}s]\nVISUAL: ${s.visual_cue}\nVOZ: ${s.voiceover}`).join("\n\n"),
                      "yt_teleprompter"
                    )
                  }
                  className="gap-1.5 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
                >
                  {copiedKey === "yt_teleprompter" ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">¡Guion Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Guion Teleprompter</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCopy(
                      `TÍTULO:\n${outputs.youtube_video.title}\n\nDESCRIPCIÓN:\n${outputs.youtube_video.description}\n\nTAGS:\n${outputs.youtube_video.tags?.join(", ")}`,
                      "yt_meta"
                    )
                  }
                  className="gap-1.5 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
                >
                  {copiedKey === "yt_meta" ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">¡Metadatos Copiados!</span>
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4" />
                      <span>Copiar Info SEO</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("https://studio.youtube.com", "_blank")}
                  className="gap-1.5 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Abrir Studio</span>
                </Button>

                <Button
                  size="sm"
                  disabled={isPublishingYouTube}
                  onClick={handleCreateYouTubeDraft}
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/40"
                >
                  {isPublishingYouTube ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Crear Borrador Automático</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Título y Gancho Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Play className="h-3.5 w-3.5 text-red-500" />
                    <span>Título del Video (Optimizado para CTR)</span>
                  </label>
                  <input
                    type="text"
                    value={outputs.youtube_video.title || ""}
                    onChange={(e) => updateYouTubeField("title", e.target.value)}
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-red-500 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Gancho Inicial (Primeros 3 Segundos)</span>
                  </label>
                  <input
                    type="text"
                    value={outputs.youtube_video.hook || ""}
                    onChange={(e) => updateYouTubeField("hook", e.target.value)}
                    className="w-full rounded-md border border-amber-950/60 bg-slate-950 px-3.5 py-2.5 text-sm text-amber-200 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Storyboard por Escenas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Film className="h-4 w-4 text-red-400" />
                    <span>Storyboard & Guion Técnico ({outputs.youtube_video.script_scenes?.length || 0} Escenas)</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Instrucciones visuales para edición + Locución exacta
                  </span>
                </div>

                <div className="space-y-3">
                  {outputs.youtube_video.script_scenes?.map((scene: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-red-600/20 text-red-400 px-2 py-0.5 text-xs font-bold border border-red-600/30">
                            Escena {scene.scene_number || idx + 1}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {scene.duration_sec || 8} segundos
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(scene.voiceover, `scene_voice_${idx}`)}
                          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                        >
                          {copiedKey === `scene_voice_${idx}` ? "¡Copiado!" : "Copiar locución"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            <span>Visual / B-Roll / Cámara:</span>
                          </span>
                          <Textarea
                            rows={3}
                            value={scene.visual_cue || ""}
                            onChange={(e) => updateScene(idx, "visual_cue", e.target.value)}
                            className="bg-slate-900 border-slate-800 text-xs text-slate-300 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <Play className="h-3.5 w-3.5" />
                            <span>Locución / Voz en off:</span>
                          </span>
                          <Textarea
                            rows={3}
                            value={scene.voiceover || ""}
                            onChange={(e) => updateScene(idx, "voiceover", e.target.value)}
                            className="bg-slate-900 border-slate-800 text-xs text-slate-100 font-sans leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Miniatura y Metadatos SEO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Descripción de YouTube */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400">Descripción & Timestamps:</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(outputs.youtube_video.description || "", "yt_desc")}
                      className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                    >
                      {copiedKey === "yt_desc" ? "¡Copiado!" : "Copiar"}
                    </Button>
                  </div>
                  <Textarea
                    rows={6}
                    value={outputs.youtube_video.description || ""}
                    onChange={(e) => updateYouTubeField("description", e.target.value)}
                    className="font-sans text-xs bg-slate-950 border-slate-800 text-slate-200"
                  />
                </div>

                {/* Prompt Miniatura & Tags */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-400">Prompt Miniatura (IA):</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(outputs.youtube_video.thumbnail_prompt || "", "yt_thumb")}
                        className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                      >
                        {copiedKey === "yt_thumb" ? "¡Copiado!" : "Copiar"}
                      </Button>
                    </div>
                    <Textarea
                      rows={3}
                      value={outputs.youtube_video.thumbnail_prompt || ""}
                      onChange={(e) => updateYouTubeField("thumbnail_prompt", e.target.value)}
                      className="font-sans text-xs bg-slate-950 border-slate-800 text-slate-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Etiquetas SEO (Tags):</label>
                    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      {outputs.youtube_video.tags?.map((tag: string, tidx: number) => (
                        <span key={tidx} className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
