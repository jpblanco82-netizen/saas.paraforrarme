"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Inicializa Gemini para la generación de la miniatura
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function createYouTubeDraft(
  title: string,
  description: string,
  tags: string[],
  thumbnailPrompt: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    const accessToken = user.user_metadata?.youtube_access_token;
    if (!accessToken) throw new Error("No hay cuenta de YouTube conectada");

    // 1. Generar la miniatura usando Gemini (modelo experimental Banana)
    console.log("Generando miniatura con IA para YouTube...");
    let base64Image = "";
    try {
      const imageModel = genAI.getGenerativeModel({ model: "models/gemini-3.1-flash-image" });
      const prompt = thumbnailPrompt || `YouTube thumbnail for: ${title}`;
      
      const result = await imageModel.generateContent(prompt);
      const response = await result.response;
      
      // El modelo devuelve la imagen codificada en base64 en parts[0].inlineData.data
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

    // 2. Preparar el video de prueba (dummy_video.mp4)
    const videoPath = path.join(process.cwd(), "public", "dummy_video.mp4");
    if (!fs.existsSync(videoPath)) {
      throw new Error("El archivo de video base no se encontró en public/dummy_video.mp4");
    }
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const videoBuffer = fs.readFileSync(videoPath);

    // 3. Subir el video a YouTube (Sesión Resumible)
    console.log("Iniciando subida de video a YouTube...");
    const metadata = {
      snippet: {
        title: title.substring(0, 100), // Max 100 chars
        description: description,
        tags: tags.slice(0, 15), // Max 15 tags approx
        categoryId: "22", // People & Blogs
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
      throw new Error("No se pudo iniciar la subida a YouTube: " + err);
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
      throw new Error("Error al subir el video.");
    }

    const videoData = await uploadResponse.json();
    const videoId = videoData.id;
    console.log(`Video subido con éxito: ${videoId}`);

    // 4. Subir la miniatura generada si existe
    if (videoId && base64Image) {
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
