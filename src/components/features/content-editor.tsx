"use client";

import { useState } from "react";
import { Copy, Check, Save, Mail, Sparkles, Share2, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateContentOutput } from "@/actions/content";

export function ContentEditor({ content }: { content: any }) {
  const [activeTab, setActiveTab] = useState<"linkedin" | "twitter" | "newsletter">("linkedin");
  const [outputs, setOutputs] = useState(content.generated_outputs || {});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publishedNotification, setPublishedNotification] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePublishToLinkedIn = () => {
    if (!outputs.linkedin) return;
    // 1. Copiar al portapapeles
    navigator.clipboard.writeText(outputs.linkedin);
    
    // 2. Abrir compositor de LinkedIn en nueva pestaña
    window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");

    // 3. Notificación al usuario
    setPublishedNotification("¡Post copiado al portapapeles y compositor de LinkedIn abierto!");
    setTimeout(() => setPublishedNotification(null), 5000);
  };

  const handlePublishToTwitter = () => {
    if (!outputs.twitter_thread || outputs.twitter_thread.length === 0) return;
    const firstTweet = outputs.twitter_thread[0];
    const encoded = encodeURIComponent(firstTweet);
    navigator.clipboard.writeText(outputs.twitter_thread.join("\n\n---\n\n"));
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");

    setPublishedNotification("¡Hilo copiado y ventana de X (Twitter) abierta!");
    setTimeout(() => setPublishedNotification(null), 5000);
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

  return (
    <div className="space-y-6">
      {/* Notificación de Publicación */}
      {publishedNotification && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-950/80 p-4 text-sm text-blue-200 border border-blue-700 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-blue-400 shrink-0" />
            <span>{publishedNotification} Solo pega (`Ctrl + V`) y dale a Publicar.</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPublishedNotification(null)}
            className="h-7 text-xs text-blue-300 hover:text-white"
          >
            Entendido
          </Button>
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

      {/* Vista de LinkedIn */}
      {activeTab === "linkedin" && outputs.linkedin && (
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-950 p-2.5 text-[#0A66C2] font-bold text-lg border border-blue-900">
                in
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">Publicación para LinkedIn</CardTitle>
                <CardDescription className="text-slate-400">
                  Estructura optimizada con ganchos de retención y debate profesional
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(outputs.linkedin, "linkedin")}
                className="gap-1.5 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
              >
                {copiedKey === "linkedin" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>

              {/* Botón de Publicación Directa en LinkedIn */}
              <Button
                size="sm"
                onClick={handlePublishToLinkedIn}
                className="gap-2 bg-[#0A66C2] hover:bg-[#084e96] text-white font-semibold shadow-lg shadow-blue-900/30"
              >
                <Send className="h-4 w-4" />
                <span>Publicar en LinkedIn</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Textarea
              rows={14}
              value={outputs.linkedin}
              onChange={(e) => updateLinkedIn(e.target.value)}
              className="font-sans text-sm leading-relaxed p-4 bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500"
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
    </div>
  );
}
