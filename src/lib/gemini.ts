const apiKey = process.env.GEMINI_API_KEY || "";

export interface ContentGenerationInput {
  sourceContent: string;
  sourceType: "text" | "url" | "video" | "podcast";
  tone: "professional" | "authoritative" | "conversational" | "storytelling" | "provocative";
  targetChannels: string[];
}

export interface GeneratedContentOutput {
  linkedin?: string;
  twitter_thread?: string[];
  newsletter?: {
    subject: string;
    preview: string;
    body: string;
  };
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
Eres el Copywriter B2B y Estratega de Crecimiento Orgánico Viral más reconocido de la industria.
Tu objetivo es transformar el siguiente tema o contenido en piezas editoriales de ALTÍSIMO IMPACTO, viralidad, profundidad y retención de lectura.

TEMA / CONTENIDO FUENTE:
"""
${input.sourceContent}
"""

PARÁMETROS:
- Tono de voz: ${input.tone} (${selectedTone})
- Formato de entrada: ${input.sourceType}
- Canales a generar: ${input.targetChannels.join(", ")}

REGLAS DE ORO DE REDACCIÓN VIRAL B2B:

1. POST DE LINKEDIN:
   - Gancho magnético en las primeras 2 líneas que obligue a pulsar "ver más".
   - Uso de datos, cifras, contrastes y análisis de causas raíz.
   - Párrafos cortos de máximo 2 oraciones para máxima legibilidad móvil.
   - 3 pilares o lecciones estructuradas con numeración clara.
   - Conclusión reflexiva y llamada a la acción (pregunta abierta) para generar debate en comentarios de directivos.
   - 3 hashtags relevantes al final.

2. HILO DE X / TWITTER (5 a 7 Tweets):
   - Tweet 1: Gancho irresistible con promesa de valor + 🧵👇.
   - Tweets intermedios: Un concepto clave por tweet, explicando el "por qué" y el "cómo".
   - Tweet final: Resumen contundente + CTA para hacer Retweet al primer tweet y seguir el perfil.

3. NEWSLETTER COMPLETA:
   - Asunto ultra-atractivo (<50 caracteres) con alto open-rate.
   - Preheader complementario intrigante.
   - Introducción con contexto profundo.
   - Secciones con subtítulos claros y desglose detallado.
   - Playbook o consejos prácticos para el lector.

4. KEY TAKEAWAYS:
   - 3 a 5 puntos clave ejecutivos de alto valor.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin texto fuera del JSON):
{
  "linkedin": "texto del post...",
  "twitter_thread": [
    "1/5 ...",
    "2/5 ...",
    "3/5 ...",
    "4/5 ...",
    "5/5 ..."
  ],
  "newsletter": {
    "subject": "...",
    "preview": "...",
    "body": "..."
  },
  "key_takeaways": [
    "...",
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
    key_takeaways: [
      "Diagnóstico exhaustivo de causas estructurales",
      "Medición de impacto económico real",
      "Optimización de protocolos de prevención",
    ],
  };
}
