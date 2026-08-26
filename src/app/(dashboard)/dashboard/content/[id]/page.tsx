import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Share2, Sparkles, Send, Edit3, Linkedin, Twitter, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentEditor } from "@/components/features/content-editor";
import { formatDate } from "@/lib/utils";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: content, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !content) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {content.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>Generado el {formatDate(content.created_at)}</span>
              <span>•</span>
              <span className="capitalize">Tono: {content.tone}</span>
            </div>
          </div>
        </div>

        <Link href="/dashboard/create">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Generar otro contenido</span>
          </Button>
        </Link>
      </div>

      {/* Editor & Preview Component */}
      <ContentEditor content={content} />
    </div>
  );
}
