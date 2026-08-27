const apiKey = process.env.GEMINI_API_KEY || "";

export interface ContentGenerationInput {
  title?: string;
  sourceContent: string;
  sourceType: "text" | "url" | "video" | "podcast";
  tone: "professional" | "authoritative" | "conversational" | "storytelling" | "provocative";
  targetChannels: string[];
}

export interface YouTubeVideoScene {
  scene_number: number;
  visual_cue: string;
  voiceover: string;
  duration_sec: number;
}

export interface YouTubeVideoOutput {
  title: string;
  hook: string;
  description: string;
  tags: string[];
  script_scenes: YouTubeVideoScene[];
  thumbnail_prompt: string;
  full_script_teleprompter: string;
}

export interface GeneratedContentOutput {
  linkedin?: string;
  twitter_thread?: string[];
  newsletter?: {
    subject: string;
    preview: string;
    body: string;
  };
  youtube_video?: YouTubeVideoOutput;
  key_takeaways?: string[];
}

async function extractContentFromUrl(url: string): Promise<string> {
  try {
    console.log("Extrayendo contenido de la URL:", url);
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
    if (!res.ok) return url;
    const html = await res.text();
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleanText.slice(0, 6000) || url;
  } catch (e) {
    console.warn("Fallo extrayendo URL, usando texto original:", e);
    return url;
  }
}

export async function generateSocialContent(
  input: ContentGenerationInput
): Promise<GeneratedContentOutput> {
  let effectiveContent = input.sourceContent.trim();

  // Si el usuario introduce una URL, descargamos el artículo real
  if (effectiveContent.startsWith("http://") || effectiveContent.startsWith("https://")) {
    effectiveContent = await extractContentFromUrl(effectiveContent);
  }

  const toneDescriptions: Record<string, string> = {
    professional: "Estratégico, riguroso, con datos, métricas y visión de negocio de alto nivel.",
    authoritative: "Directo, asertivo, líder de opinión que desafía el status quo con convicción y hechos contundentes.",
    conversational: "Cercano, empático, sin tecnicismos innecesarios, como un mentor o directivo de confianza.",
    storytelling: "Narrativo, enfocado en el conflicto, la transformación humana y las lecciones prácticas aplicadas.",
    provocative: "Disruptivo, contrario al pensamiento convencional, con ganchos que detienen el scroll.",
  };

  const selectedTone = toneDescriptions[input.tone] || toneDescriptions.professional;
  const projectTitle = input.title ? `TÍTULO PRINCIPAL: "${input.title}"` : "";

  const systemPrompt = `
Eres el Copywriter B2B, Director Audiovisual y Creador de Contenido Viral más reconocido de la industria.
Tu misión es analizar rigurosamente el siguiente contenido y adaptarlo con precisión MILIMÉTRICA a los canales seleccionados.

${projectTitle}
CONTENIDO FUENTE QUE DEBES TRANSFORMAR OBLIGATORIAMENTE:
"""
${effectiveContent}
"""

PARÁMETROS:
- Tono: ${input.tone} (${selectedTone})
- Canales solicitados: ${input.targetChannels.join(", ")}

CRITERIOS ESTRICTOS DE GENERACIÓN:
1. TODO el contenido (LinkedIn, Tweets, Newsletter, Video de YouTube) DEBE basarse 100% en el tema y argumentos específicos del CONTENIDO FUENTE proporcionado. NO inventes temas genéricos no relacionados.
2. Si el canal solicitado es "youtube", debes crear un guion y producción completa que explique el contenido fuente paso a paso:
   - title: Título atractivo con alto CTR (<60 caracteres) sobre el tema real.
   - hook: Gancho impactante de los primeros 3 segundos.
   - description: Resumen completo para YouTube, timestamps y hashtags.
   - tags: 6 a 10 etiquetas SEO relevantes al tema.
   - thumbnail_prompt: Prompt fotográfico en inglés para la miniatura perfecta sobre el tema.
   - full_script_teleprompter: Guion narrativo continuo para leer en teleprompter (aproximadamente 65-75 palabras para que dure exactamente 30 segundos hablado a ritmo normal).
   - script_scenes: 3 a 5 escenas técnicas (scene_number, visual_cue, voiceover, duration_sec). La suma de la duración de todas las escenas DEBE SER de aproximadamente 30 segundos (formato Short/Reel).
3. Si el canal es "linkedin", crea un post magnético con gancho, desarrollo en 3 puntos y llamada a la acción.
4. Si el canal es "twitter", genera un hilo de 4 a 6 tweets bien estructurados.
5. Si el canal es "newsletter", escribe un correo completo con subject, preview y cuerpo con subtítulos.

Devuelve ÚNICAMENTE un objeto JSON válido con este formato:
{
  "linkedin": "texto del post...",
  "twitter_thread": [
    "1/4 ...",
    "2/4 ..."
  ],
  "newsletter": {
    "subject": "...",
    "preview": "...",
    "body": "..."
  },
  "youtube_video": {
    "title": "...",
    "hook": "...",
    "description": "...",
    "tags": ["...", "..."],
    "thumbnail_prompt": "...",
    "full_script_teleprompter": "...",
    "script_scenes": [
      {
        "scene_number": 1,
        "visual_cue": "...",
        "voiceover": "...",
        "duration_sec": 8
      }
    ]
  },
  "key_takeaways": [
    "...",
    "..."
  ]
}
`;

  try {
    if (!apiKey || apiKey.startsWith("placeholder") || apiKey.length < 10) {
      console.warn("No valid GEMINI_API_KEY, falling back to dynamic local engine");
      return generateDynamicFallback(input, effectiveContent);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.6,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API non-200 response:", response.status, await response.text());
      return generateDynamicFallback(input, effectiveContent);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateDynamicFallback(input, effectiveContent);
    }

    return JSON.parse(candidateText) as GeneratedContentOutput;
  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    return generateDynamicFallback(input, effectiveContent);
  }
}

function generateDynamicFallback(input: ContentGenerationInput, text: string): GeneratedContentOutput {
  const title = input.title || text.slice(0, 50);
  const sentences = text.split(/(?<=[.?!])\s+/).filter((s) => s.length > 10);
  const p1 = sentences[0] || text.slice(0, 150);
  const p2 = sentences[1] || "Implementación práctica y metodologías de trabajo.";
  const p3 = sentences[2] || "Medición constante de métricas y retorno de inversión.";

  return {
    linkedin: `¿Cómo abordar estratégicamente: ${title}?\n\nAnalizando los aspectos clave de este desafío:\n\n1️⃣ ${p1}\n2️⃣ ${p2}\n3️⃣ ${p3}\n\n💡 ¿Cuál es tu enfoque en tu organización?\n\n#Estrategia #Liderazgo #B2B`,
    twitter_thread: [
      `1/3 🧵 Claves estratégicas sobre: ${title}\n\nAbro hilo 👇`,
      `2/3 📌 ${p1}`,
      `3/3 🎯 Conclusión: ${p2}\n\n¿Qué opinas al respecto? Haz RT si te resultó útil.`,
    ],
    newsletter: {
      subject: `Estrategia: ${title.slice(0, 40)}`,
      preview: `Lecciones clave sobre ${title}`,
      body: `Hola,\n\nEn este análisis exploramos a fondo:\n\n${p1}\n\n${p2}\n\nEsperamos que te sea de utilidad.\n\nUn saludo,\nEquipo MultiContent AI`,
    },
    youtube_video: {
      title: `Dominando ${title.slice(0, 50)}: Claves y Estrategias`,
      hook: `¿Te has preguntado cómo impacta ${title.slice(0, 30)} en los resultados reales?`,
      description: `Análisis exhaustivo sobre ${title}.\n\n0:00 Introducción\n1:00 Claves Principales\n2:30 Conclusiones\n\n#Estrategia #Negocios #YouTube`,
      tags: ["estrategia", "negocios", "innovacion", "productividad"],
      thumbnail_prompt: `Modern corporate editorial photography about ${title}, high contrast, dramatic lighting, 8k resolution`,
      full_script_teleprompter: `Hoy vamos a hablar sobre ${title}.\n\nPrimero: ${p1}.\nSegundo: ${p2}.\n\nSuscríbete para más análisis estratégicos.`,
      script_scenes: [
        {
          scene_number: 1,
          visual_cue: `Presentador en plano medio introduciendo el tema ${title}.`,
          voiceover: `Hoy vamos a desgranar las claves sobre ${title}.`,
          duration_sec: 8,
        },
        {
          scene_number: 2,
          visual_cue: "Gráficos explicativos y b-roll temático en pantalla.",
          voiceover: p1,
          duration_sec: 12,
        },
        {
          scene_number: 3,
          visual_cue: "Llamada a la acción con botones interactivos.",
          voiceover: "Aplica estas lecciones en tu operativa diaria.",
          duration_sec: 8,
        },
      ],
    },
    key_takeaways: [
      p1.slice(0, 80),
      p2.slice(0, 80),
    ],
  };
}
