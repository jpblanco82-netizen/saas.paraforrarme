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

    if (!linkedinToken || !linkedinPersonUrn) {
      return {
        success: false,
        message: "No tienes tu cuenta de LinkedIn conectada. Por favor, conéctala primero.",
        postUrl: "/api/auth/linkedin",
      };
    }

    // 1. Generar la imagen con Gemini 3.1 Flash Image (Banana)
    console.log("Generando imagen con IA para el post de LinkedIn...");
    let base64Image: string | null = null;
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const imageRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `A highly professional and cinematic editorial illustration for a LinkedIn article about: ${text.slice(0, 250)}. Modern corporate aesthetic, high quality, no text.`
            }]
          }]
        })
      });
      const imageData = await imageRes.json();
      base64Image = imageData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Image) {
        console.log("Imagen generada con éxito para LinkedIn.");
      }
    } catch (imgError) {
      console.error("Error generando imagen para LinkedIn:", imgError);
    }

    // 2. Subir el activo de imagen a LinkedIn si existe
    let assetUrn: string | null = null;
    if (base64Image) {
      try {
        console.log("Registrando subida de imagen en LinkedIn...");
        const registerResponse = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${linkedinToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: linkedinPersonUrn,
              supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"],
            },
          }),
        });

        if (registerResponse.ok) {
          const registerData = await registerResponse.json();
          const uploadUrl = registerData.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
          assetUrn = registerData.value?.asset;

          if (uploadUrl && assetUrn) {
            console.log("Subiendo bytes de imagen a LinkedIn...");
            const imageBuffer = Buffer.from(base64Image, "base64");
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${linkedinToken}`,
                "Content-Type": "image/jpeg",
              },
              body: imageBuffer,
            });

            if (!uploadRes.ok) {
              console.warn("Fallo al subir la imagen binaria a LinkedIn:", await uploadRes.text());
              assetUrn = null;
            } else {
              console.log("Imagen subida a LinkedIn exitosamente:", assetUrn);
            }
          }
        } else {
          console.warn("No se pudo registrar la subida en LinkedIn:", await registerResponse.text());
        }
      } catch (uploadError) {
        console.error("Error en el proceso de subida de imagen a LinkedIn:", uploadError);
        assetUrn = null;
      }
    }

    // 3. Crear la publicación en LinkedIn (con o sin imagen)
    const specificContent: any = {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: assetUrn ? "IMAGE" : "NONE",
      },
    };

    if (assetUrn) {
      specificContent["com.linkedin.ugc.ShareContent"].media = [
        {
          status: "READY",
          description: {
            text: "Portada generada con IA para LinkedIn",
          },
          media: assetUrn,
          title: {
            text: text.slice(0, 60),
          },
        },
      ];
    }

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
        specificContent: specificContent,
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
      message: "¡Publicado exitosamente en tu perfil de LinkedIn con portada IA!",
      postId: postId,
      postUrl: "https://www.linkedin.com/feed/",
    };

  } catch (error: any) {
    console.error("LinkedIn publish crash:", error);
    return {
      success: false,
      message: error.message || "Ocurrió un error inesperado al publicar en LinkedIn",
    };
  }
}
