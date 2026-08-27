"use server";

import { createClient } from "@supabase/supabase-js";

// Credenciales directas de Nodalio
const NODALIO_SUPABASE_URL = "https://qczgffjhqwveizzjshxv.supabase.co";
const NODALIO_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjemdmZmpocXd2ZWl6empzaHh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkyMDA4NSwiZXhwIjoyMDg5NDk2MDg1fQ.Ak88kXsmeF7NR3FTQg8yDg3RcGXPLsVZNWwr6fZDV4k";

export async function publishDirectToNodalio(title: string, content: string) {
  try {
    if (!title || !content) {
      return { success: false, message: "El título y el contenido son obligatorios" };
    }

    const nodalioDb = createClient(NODALIO_SUPABASE_URL, NODALIO_SERVICE_KEY);

    // 1. Generar un slug único
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    let imageUrl = null;

    // 2. Generar Imagen con Gemini 3.1 Flash Image (Banana)
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const imageRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `A highly professional and cinematic blog cover image about: ${title}. High quality, modern corporate style, no text.` }] }]
        })
      });
      const imageData = await imageRes.json();
      const base64Image = imageData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Image) {
        // 3. Subir a Supabase Storage (academy-content)
        const buffer = Buffer.from(base64Image, 'base64');
        const fileName = `blog/${slug}.jpg`;
        
        const { error: uploadError } = await nodalioDb.storage
          .from("academy-content")
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (!uploadError) {
          // Obtener la URL pública
          const { data: publicUrlData } = nodalioDb.storage
            .from("academy-content")
            .getPublicUrl(fileName);
          
          imageUrl = publicUrlData.publicUrl;
        } else {
          console.error("Error subiendo imagen a Nodalio:", uploadError);
        }
      }
    } catch (imgError) {
      console.error("Error generando imagen con Gemini:", imgError);
    }

    // 4. Insertar en la base de datos de Nodalio con la imagen
    const { error } = await nodalioDb
      .from("blog_posts")
      .insert([
        {
          title,
          content,
          slug,
          image_url: imageUrl,
          is_published: true,
          published_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Nodalio DB Insert Error:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "¡Publicado con éxito en el blog de Nodalio!", url: `https://www.nodalio.es/blog/${slug}` };
  } catch (error: any) {
    console.error("Nodalio action crash:", error);
    return { success: false, message: error.message || "Error desconocido al conectar con Nodalio" };
  }
}
