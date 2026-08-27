"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateSocialContent } from "@/lib/gemini";
import { checkPaywallStatus } from "@/lib/paywall";

const contentGenerationSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  sourceType: z.enum(["text", "url", "video", "podcast"]),
  sourceContent: z.string().min(20, "El contenido fuente debe tener al menos 20 caracteres"),
  tone: z.enum(["professional", "authoritative", "conversational", "storytelling", "provocative"]),
  targetChannels: z.array(z.string()).min(1, "Debes seleccionar al menos un canal"),
});

export async function createAndTransformContent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para generar contenido" };
  }

  // 1. Validar Muro de Pago
  const paywallStatus = await checkPaywallStatus(user.id);
  if (!paywallStatus.isAllowed) {
    return {
      error: "PAYWALL_BLOCKED",
      message: "Tu prueba de 7 días ha finalizado. Por favor selecciona un plan para continuar.",
    };
  }

  // 2. Validar Inputs con Zod
  const rawData = {
    title: formData.get("title") as string,
    sourceType: formData.get("sourceType") as any,
    sourceContent: formData.get("sourceContent") as string,
    tone: formData.get("tone") as any,
    targetChannels: formData.getAll("targetChannels") as string[],
  };

  const validation = contentGenerationSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { title, sourceType, sourceContent, tone, targetChannels } = validation.data;

  // 3. Crear registro inicial en la base de datos
  const { data: contentRecord, error: insertError } = await supabase
    .from("contents")
    .insert({
      user_id: user.id,
      title,
      source_type: sourceType,
      source_content: sourceContent,
      tone,
      target_channels: targetChannels,
      status: "processing",
    })
    .select()
    .single();

  if (insertError || !contentRecord) {
    return { error: "No se pudo iniciar el procesamiento de contenido" };
  }

  try {
    // 4. Llamar al motor de IA
    const generatedOutputs = await generateSocialContent({
      title,
      sourceContent,
      sourceType,
      tone,
      targetChannels,
    });

    // 5. Actualizar registro con resultados
    const { error: updateError } = await supabase
      .from("contents")
      .update({
        generated_outputs: generatedOutputs,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", contentRecord.id);

    if (updateError) {
      console.error("Error updating content:", updateError);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/create");
    return { success: true, contentId: contentRecord.id };
  } catch (err: any) {
    await supabase
      .from("contents")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", contentRecord.id);

    return { error: "Ocurrió un error al procesar el contenido con la IA" };
  }
}

export async function updateContentOutput(contentId: string, updatedOutputs: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("contents")
    .update({
      generated_outputs: updatedOutputs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contentId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "No se pudieron guardar los cambios" };
  }

  revalidatePath(`/dashboard/content/${contentId}`);
  return { success: true };
}

export async function deleteContent(contentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("contents")
    .delete()
    .eq("id", contentId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "No se pudo borrar el contenido" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
