"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DUMMY_VIDEO_BASE64 } from "@/lib/dummy-video";

// Inicializa Gemini para la generación de la miniatura
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getValidAccessToken(user: any, supabase: any) {
  let accessToken = user.user_metadata?.youtube_access_token;
  const refreshToken = user.user_metadata?.youtube_refresh_token;
  const expiry = user.user_metadata?.youtube_token_expiry;

  const isExpired = expiry ? new Date(expiry).getTime() < Date.now() + 60000 : false;

  // Si está expirado o no hay access_token pero hay refresh_token, lo refrescamos automáticamente
  if ((!accessToken || isExpired) && refreshToken) {
    console.log("Token de YouTube expirado o ausente. Refrescando con refresh_token...");
    try {
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const refreshData = await refreshResponse.json();
      if (refreshData.access_token) {
        accessToken = refreshData.access_token;
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + (refreshData.expires_in || 3600));

        const updates = {
          youtube_access_token: accessToken,
          youtube_token_expiry: expiryDate.toISOString(),
        };

        await supabase.auth.updateUser({
          data: updates,
        });

        try {
          const adminClient = await createAdminClient();
          await adminClient.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              ...updates,
            },
          });
        } catch {}

        console.log("Token de YouTube refrescado exitosamente.");
      } else {
        console.error("Error al refrescar token:", refreshData);
      }
    } catch (err) {
      console.error("Excepción refrescando token de YouTube:", err);
    }
  }

  return accessToken;
}

export async function createYouTubeDraft(
  title: string,
  description: string,
  tags: string[],
  thumbnailPrompt: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Debes iniciar sesión para realizar esta acción");

    // Obtener datos frescos del usuario desde DB Admin para evitar desfases de cookies
    let freshUser = user;
    try {
      const adminClient = await createAdminClient();
      const { data: { user: dbUser } } = await adminClient.auth.admin.getUserById(user.id);
      if (dbUser) freshUser = dbUser;
    } catch (e) {
      console.warn("No se pudo obtener usuario admin, usando sesión:", e);
    }

    const accessToken = await getValidAccessToken(freshUser, supabase);
    if (!accessToken) {
      throw new Error("No tienes tu cuenta de YouTube conectada. Ve a https://saas-paraforrarme.vercel.app/api/auth/youtube para vincularla.");
    }

    // 1. Generar la miniatura usando Gemini (modelo experimental Banana)
    console.log("Generando miniatura con IA para YouTube...");
    let base64Image = "";
    try {
      const imageModel = genAI.getGenerativeModel({ model: "models/gemini-3.1-flash-image" });
      const prompt = thumbnailPrompt || `YouTube thumbnail for: ${title}`;
      
      const result = await imageModel.generateContent(prompt);
      const response = await result.response;
      
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts && parts.length > 0 && parts[0].inlineData) {
        base64Image = parts[0].inlineData.data;
        console.log("Miniatura generada exitosamente.");
      } else {
        console.warn("No se pudo extraer la imagen generada.");
      }
    } catch (imgError) {
      console.error("Error generando miniatura:", imgError);
    }

    // 2. Preparar el buffer del video base 100% en memoria
    const videoBuffer = Buffer.from(DUMMY_VIDEO_BASE64, "base64");
    const fileSize = videoBuffer.length;

    // 3. Subir el video a YouTube (Sesión Resumible)
    console.log("Iniciando subida de video a YouTube...");
    const metadata = {
      snippet: {
        title: title.substring(0, 100),
        description: description,
        tags: tags.slice(0, 15),
        categoryId: "22",
      },
      status: {
        privacyStatus: "private", // Siempre privado como borrador
        selfDeclaredMadeForKids: false,
      }
    };

    // Paso 3.1: Iniciar sesión de subida
    const initResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Length": fileSize.toString(),
          "X-Upload-Content-Type": "video/mp4",
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initResponse.ok) {
      const err = await initResponse.text();
      console.error("Error iniciando subida:", err);
      throw new Error(`Google API Error (${initResponse.status}): ${err}`);
    }

    const uploadUrl = initResponse.headers.get("Location");
    if (!uploadUrl) throw new Error("No se recibió la URL de subida");

    // Paso 3.2: Subir los bytes del video
    console.log("Subiendo bytes del video...");
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      const err = await uploadResponse.text();
      console.error("Error subiendo bytes:", err);
      throw new Error("Error al subir el video: " + err);
    }

    const videoData = await uploadResponse.json();
    const videoId = videoData.id;
    console.log(`Video subido con éxito: ${videoId}`);

    // 4. Subir la miniatura generada si existe
    if (videoId && base64Image) {
      try {
        console.log("Subiendo miniatura al video...");
        const imageBuffer = Buffer.from(base64Image, "base64");
        
        const thumbResponse = await fetch(
          `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "image/jpeg",
            },
            body: imageBuffer,
          }
        );

        if (!thumbResponse.ok) {
          console.warn("No se pudo subir la miniatura. Error:", await thumbResponse.text());
        } else {
          console.log("Miniatura subida exitosamente.");
        }
      } catch (thumbErr) {
        console.error("Error subiendo miniatura:", thumbErr);
      }
    }

    // Retornar la URL de edición en YouTube Studio
    return {
      success: true,
      videoId: videoId,
      studioUrl: `https://studio.youtube.com/video/${videoId}/edit`
    };

  } catch (error: any) {
    console.error("Error en createYouTubeDraft:", error);
    return {
      success: false,
      message: error.message || "Ocurrió un error inesperado al subir a YouTube"
    };
  }
}
