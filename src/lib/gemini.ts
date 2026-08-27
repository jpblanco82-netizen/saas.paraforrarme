const apiKey = process.env.GEMINI_API_KEY || "";

export interface ContentGenerationInput {
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

export async function generateSocialContent(
  input: ContentGenerationInput
): Promise<GeneratedContentOutput> {
  const toneDescriptions: Record<string, string> = {
    professional: "Estratégico, con datos económicos, métricas corporativas y visión de negocio de alto nivel.",
    authoritative: "Directo, asertivo, líder de opinión que desafía el status quo con convicción y hechos contundentes.",
    conversational: "Cercano, empático, sin tecnicismos innecesarios, como un mentor o directivo de confianza.",
    storytelling: "Narrativo, enfocado en el conflicto, la transformación humana y las lecciones prácticas aplicadas.",
    provocative: "Disruptivo, contrario al pensamiento convencional, con ganchos que detienen el scroll.",
  };

  const selectedTone = toneDescriptions[input.tone] || toneDescriptions.professional;

  const systemPrompt = `
Eres el Copywriter B2B, Director Audiovisual y Estratega de Crecimiento Orgánico Viral más reconocido de la industria.
Tu objetivo es transformar el siguiente tema o contenido en piezas editoriales y audiovisuales de ALTÍSIMO IMPACTO, viralidad, profundidad y retención.

TEMA / CONTENIDO FUENTE:
"""
${input.sourceContent}
"""

PARÁMETROS:
- Tono de voz: ${input.tone} (${selectedTone})
- Formato de entrada: ${input.sourceType}
- Canales a generar: ${input.targetChannels.join(", ")}

REGLAS DE ORO DE REDACCIÓN Y PRODUCCIÓN VIRAL:

1. POST DE LINKEDIN:
   - Gancho magnético en las primeras 2 líneas que obligue a pulsar "ver más".
   - Uso de datos, cifras, contrastes y análisis de causas raíz.
   - Párrafos cortos de máximo 2 oraciones para máxima legibilidad móvil.
   - 3 pilares o lecciones estructuradas con numeración clara.
   - Conclusión reflexiva y llamada a la acción para comentarios.
   - 3 hashtags relevantes al final.

2. HILO DE X / TWITTER (5 a 7 Tweets):
   - Tweet 1: Gancho irresistible con promesa de valor + 🧵👇.
   - Tweets intermedios: Un concepto clave por tweet.
   - Tweet final: Resumen contundente + CTA para RT.

3. NEWSLETTER COMPLETA:
   - Asunto ultra-atractivo (<50 caracteres) con alto open-rate.
   - Preheader complementario intrigante.
   - Introducción con contexto profundo y desarrollo detallado con subtítulos.

4. GUION & PRODUCCIÓN DE VIDEO (YOUTUBE / SHORTS / REELS):
   - title: Título viral de alto CTR para YouTube (<60 caracteres).
   - hook: Gancho demoledor de los primeros 3 segundos.
   - description: Descripción completa para YouTube con resumen, timestamps clave y hashtags.
   - tags: Array de 6-10 etiquetas SEO para posicionar el video.
   - thumbnail_prompt: Prompt fotográfico en inglés para generar la miniatura perfecta con IA.
   - full_script_teleprompter: Guion narrativo continuo formateado para leer en teleprompter.
   - script_scenes: Array de 4 a 6 escenas del storyboard, cada una con:
       * scene_number: número entero (1, 2, 3...)
       * visual_cue: qué se muestra en pantalla (ej: Primer plano del presentador con gráfico en pantalla, B-roll cinemático de oficina, animación de texto dinámico).
       * voiceover: locución exacta que dice el narrador en esta escena.
       * duration_sec: duración estimada en segundos (ej: 8, 12, 15).

5. KEY TAKEAWAYS:
   - 3 a 5 puntos clave ejecutivos de alto valor.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin markdown ni texto fuera del JSON):
{
  "linkedin": "texto del post...",
  "twitter_thread": [
    "1/5 ...",
    "2/5 ..."
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
      console.warn("No valid GEMINI_API_KEY, falling back to local engine");
      return generateDeepEngineContent(input);
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
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API non-200 response:", response.status, response.statusText);
      return generateDeepEngineContent(input);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateDeepEngineContent(input);
    }

    return JSON.parse(candidateText) as GeneratedContentOutput;
  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    return generateDeepEngineContent(input);
  }
}

function generateDeepEngineContent(input: ContentGenerationInput): GeneratedContentOutput {
  const content = input.sourceContent.trim();
  const sentences = content.split(/(?<=[.?!])\s+/).filter((s) => s.length > 15);
  const coreThesis = sentences[0] || content.slice(0, 120);

  return {
    linkedin: `El mayor error en las organizaciones es ignorar las causas estructurales detrás de los números.\n\nAnalizando: "${coreThesis}"\n\n📌 3 aprendizajes esenciales:\n1️⃣ Diagnóstico real sobre síntomas superficiales.\n2️⃣ Optimización de procesos internos para evitar fricción.\n3️⃣ Enfoque directo en el impacto económico y la sostenibilidad del equipo.\n\n💡 ¿Cuál de estos pilares es más urgente en tu sector hoy?\n\n#B2B #Estrategia #Liderazgo`,
    twitter_thread: [
      `1/4 🧵 Convertir ideas complejas en resultados claros es la habilidad clave de los líderes.\n\nAquí el análisis: 👇`,
      `2/4 🎯 Punto 1: Las métricas de vanidad distraen de los problemas reales.`,
      `3/4 ⚡ Punto 2: La prevención temprana ahorra hasta un 80% de costes operativos.`,
      `4/4 🔄 Si te aportó valor, haz RT al primer tweet y comparte tu perspectiva.`,
    ],
    newsletter: {
      subject: `Estrategia y Análisis: ${input.sourceContent.slice(0, 40)}...`,
      preview: "Lecciones clave para directivos y líderes de equipo.",
      body: `Hola,\n\nEn la edición de hoy analizamos a fondo este tema clave:\n"${coreThesis}"\n\nEsperamos que estas ideas te sirvan para tu próxima reunión de estrategia.\n\nUn saludo,\nEquipo MultiContent AI`,
    },
    youtube_video: {
      title: `El error crítico que el 90% comete con ${input.sourceContent.slice(0, 30)}`,
      hook: "¿Sabías que la mayoría de empresas pierden miles de euros por un simple error que ignoran a diario?",
      description: `En este video analizamos a fondo las claves y estrategias para dominar este desafío.\n\n0:00 Introducción y Contexto\n0:45 Diagnóstico del Problema\n1:30 Los 3 Pilares de Solución\n2:45 Conclusión y Plan de Acción\n\n#B2B #Negocios #Estrategia #YouTube`,
      tags: ["estrategia b2b", "negocios", "crecimiento", "productividad", "liderazgo"],
      thumbnail_prompt: "High contrast YouTube thumbnail, expressive business professional pointing to a rising graph with bold question mark, dramatic lighting, 8k",
      full_script_teleprompter: `¿Sabías que la mayoría de organizaciones pierden miles de euros por un error que ignoran a diario?\n\nAl analizar este problema, descubrimos que los líderes exitosos aplican 3 principios clave:\nPrimero: Diagnosticar la causa raíz antes de aumentar el gasto.\nSegundo: Sistematizar los procesos para eliminar fricciones.\nY tercero: Alinear cada acción con el impacto económico directo.\n\nSi quieres aplicar este framework en tu equipo, suscríbete para más análisis estratégicos.`,
      script_scenes: [
        {
          scene_number: 1,
          visual_cue: "Primer plano dramático del presentador mirando a cámara. Aparece texto con gancho.",
          voiceover: "¿Sabías que la mayoría de organizaciones pierden miles de euros por un error que ignoran a diario?",
          duration_sec: 5,
        },
        {
          scene_number: 2,
          visual_cue: "B-roll dinámico de gráficos y oficina corporativa con transición rápida.",
          voiceover: "Al analizar este problema, descubrimos que los líderes exitosos aplican 3 principios clave.",
          duration_sec: 7,
        },
        {
          scene_number: 3,
          visual_cue: "Gráfico explicativo en pantalla dividida con los 3 pilares estratégicos.",
          voiceover: "Primero: Diagnosticar la causa raíz. Segundo: Sistematizar procesos. Tercero: Medir el impacto económico.",
          duration_sec: 10,
        },
        {
          scene_number: 4,
          visual_cue: "Plano medio del presentador con botón de suscripción y llamada a la acción animada.",
          voiceover: "Si quieres aplicar este framework en tu equipo, suscríbete para más análisis estratégicos.",
          duration_sec: 6,
        },
      ],
    },
    key_takeaways: [
      "Diagnóstico exhaustivo de causas estructurales",
      "Medición de impacto económico real",
      "Optimización de protocolos de prevención",
    ],
  };
}
