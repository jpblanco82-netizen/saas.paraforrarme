"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface LinkedInPublishResult {
  success: boolean;
  message: string;
  postUrl?: string;
  postId?: string;
}

export async function publishDirectToLinkedIn(
  contentId: string,
  text: string
): Promise<LinkedInPublishResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Debes iniciar sesión para publicar.",
    };
  }

  if (!text || text.trim().length === 0) {
    return {
      success: false,
      message: "El contenido del post no puede estar vacío.",
    };
  }

  try {
    const linkedinToken = user.user_metadata?.linkedin_access_token;
    const linkedinPersonUrn = user.user_metadata?.linkedin_person_urn;

    // Si hay credenciales de LinkedIn API configuradas en el usuario:
    if (linkedinToken && linkedinPersonUrn) {
      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${linkedinToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: linkedinPersonUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: text,
              },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("LinkedIn API Error:", errorData);
        return {
          success: false,
          message: errorData.message || "Error al conectar con la API de LinkedIn",
        };
      }

      const result = await response.json();
      const postId = result.id;

      // Actualizar estado del contenido a 'published'
      await supabase
        .from("contents")
        .update({ status: "published", updated_at: new Date().toISOString() })
        .eq("id", contentId);

      revalidatePath(`/dashboard/content/${contentId}`);
      revalidatePath("/dashboard");

      return {
        success: true,
        message: "¡Publicado exitosamente en tu perfil de LinkedIn!",
        postId: postId,
        postUrl: "https://www.linkedin.com/feed/",
      };
    }

    // Si no hay credenciales, pedir que se conecte
    return {
      success: false,
      message: "No tienes tu cuenta de LinkedIn conectada. Por favor, conéctala primero.",
      postUrl: "/api/auth/linkedin",
    };
  } catch (error: any) {
    console.error("LinkedIn publish crash:", error);
    return {
      success: false,
      message: error.message || "Ocurrió un error inesperado al publicar en LinkedIn",
    };
  }
}
