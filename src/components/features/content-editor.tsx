"use client";

import { useState } from "react";
import { Copy, Check, Save, Linkedin, Twitter, Mail, Sparkles } from "lucide-react";
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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
      {/* Selector de Pestañas */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex gap-2">
          {outputs.linkedin && (
            <Button
              type="button"
              variant={activeTab === "linkedin" ? "default" : "outline"}
              onClick={() => setActiveTab("linkedin")}
              className="gap-2"
            >
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
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
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
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
              <Mail className="h-4 w-4 text-emerald-600" />
              <span>Newsletter</span>
            </Button>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          variant="outline"
          className="gap-1.5"
        >
          {saveSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">¡Cambios guardados!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Guardando..." : "Guardar Modificaciones"}</span>
            </>
          )}
        </Button>
      </div>

      {/* Vista de LinkedIn */}
      {activeTab === "linkedin" && outputs.linkedin && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-[#0A66C2] dark:bg-blue-950">
                <Linkedin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Publicación para LinkedIn</CardTitle>
                <CardDescription>Optimizado para retención y engagement profesional</CardDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(outputs.linkedin, "linkedin")}
              className="gap-1.5"
            >
              {copiedKey === "linkedin" ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Post</span>
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={12}
              value={outputs.linkedin}
              onChange={(e) => updateLinkedIn(e.target.value)}
              className="font-sans text-sm leading-relaxed p-4 bg-slate-50/50 dark:bg-slate-900/50"
            />
          </CardContent>
        </Card>
      )}

      {/* Vista de Twitter / X Thread */}
      {activeTab === "twitter" && outputs.twitter_thread && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              Hilo de {outputs.twitter_thread.length} Tweets
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(outputs.twitter_thread.join("\n\n---\n\n"), "all_tweets")}
              className="gap-1.5"
            >
              {copiedKey === "all_tweets" ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">¡Hilo Completo Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Todo el Hilo</span>
                </>
              )}
            </Button>
          </div>

          {outputs.twitter_thread.map((tweet: string, idx: number) => (
            <Card key={idx} className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Tweet #{idx + 1}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(tweet, `tweet_${idx}`)}
                  className="h-7 px-2 text-xs gap-1"
                >
                  {copiedKey === `tweet_${idx}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado</span>
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
                  className="text-sm font-sans"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de Newsletter */}
      {activeTab === "newsletter" && outputs.newsletter && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Edición para Newsletter</CardTitle>
                <CardDescription>Estructurada para alta tasa de apertura y lectura</CardDescription>
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
              className="gap-1.5"
            >
              {copiedKey === "newsletter_all" ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Newsletter</span>
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Asunto:</label>
              <input
                type="text"
                value={outputs.newsletter.subject || ""}
                onChange={(e) => updateNewsletter("subject", e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Preheader / Preview:</label>
              <input
                type="text"
                value={outputs.newsletter.preview || ""}
                onChange={(e) => updateNewsletter("preview", e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Cuerpo del Email:</label>
              <Textarea
                rows={10}
                value={outputs.newsletter.body || ""}
                onChange={(e) => updateNewsletter("body", e.target.value)}
                className="font-sans text-sm leading-relaxed p-4 bg-slate-50/50 dark:bg-slate-900/50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
