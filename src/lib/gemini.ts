import { GoogleGenAI } from "@google/genai";

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
  const prompt = `
Actúa como un estratega de contenido B2B de primer nivel y especialista en crecimiento orgánico en redes sociales.
Tu objetivo es transformar el siguiente contenido original en piezas de contenido optimizadas para monetización y alcance según los canales seleccionados.

Canales objetivo: ${input.targetChannels.join(", ")}
Tono de voz: ${input.tone}
Tipo de fuente: ${input.sourceType}

Contenido original:
"""
${input.sourceContent}
"""

Instrucciones por canal:
1. LinkedIn (si aplica): Gancho contundente en las primeras 2 líneas, espaciado legible, párrafos de máximo 2 oraciones, lecciones prácticas y una llamada a la acción (CTA) profesional para generar comentarios.
2. Twitter/X (si aplica): Un hilo (array de tweets) de 3 a 5 tweets. El primer tweet debe ser un gancho irresistible. Cada tweet debe aportar valor autónomo.
3. Newsletter (si aplica): Asunto con alto open-rate (<50 caracteres), pre-header tentador, introducción concisa, desarrollo con viñetas y conclusión accionable.

Devuelve EXCLUSIVAMENTE un JSON válido con la siguiente estructura (sin formato markdown adicional fuera del JSON):
{
  "linkedin": "texto del post de LinkedIn...",
  "twitter_thread": [
    "Tweet 1 (Hook)...",
    "Tweet 2...",
    "Tweet 3 (CTA)..."
  ],
  "newsletter": {
    "subject": "Asunto...",
    "preview": "Pre-header...",
    "body": "Cuerpo completo de la newsletter..."
  },
  "key_takeaways": [
    "Punto clave 1",
    "Punto clave 2",
    "Punto clave 3"
  ]
}
`;

  try {
    if (!apiKey || apiKey.startsWith("placeholder")) {
      // Fallback inteligente para entorno de desarrollo / demo sin credenciales
      return getMockGeneratedContent(input);
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    return JSON.parse(responseText) as GeneratedContentOutput;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    // En caso de fallo de red o cuota, devolver una respuesta estructurada
    return getMockGeneratedContent(input);
  }
}

function getMockGeneratedContent(input: ContentGenerationInput): GeneratedContentOutput {
  const preview = input.sourceContent.slice(0, 150) + "...";
  return {
    linkedin: `🚀 La mayoría de las empresas cometen este error crítico al crear contenido...\n\nAnalizando: "${preview}"\n\nAquí tienes las 3 claves esenciales para destacar:\n\n1️⃣ Enfócate en el problema real de tu cliente B2B.\n2️⃣ Simplifica el mensaje eliminando tecnicismos innecesarios.\n3️⃣ Entrega un framework accionable que puedan aplicar hoy mismo.\n\n💡 ¿Cuál de estos pilares consideras más difícil de escalar en tu organización?\n\n#SaaS #B2B #Growth #Strategy`,
    twitter_thread: [
      `1/4 🧵 Convertir contenido largo en valor inmediato es la clave del crecimiento orgánico B2B.\n\nAquí el desglose práctico: 👇`,
      `2/4 🎯 Lección 1: No vendas la herramienta, vende la transformación. La audiencia conecta con resultados tangibles.`,
      `3/4 ⚡ Lección 2: La consistencia supera a la perfección. Publicar frameworks simples genera 10x más confianza.`,
      `4/4 🔄 Si te sirvió este desglose, comparte el primer tweet y suscríbete para más análisis estratégicos semanales.`,
    ],
    newsletter: {
      subject: "Framework Estratégico: Cómo escalar tu distribución de contenido",
      preview: "3 lecciones prácticas para optimizar el alcance de tu empresa hoy.",
      body: `Hola,\n\nEn la edición de hoy analizamos cómo transformar ideas complejas en activos de alto rendimiento para tu negocio.\n\n**Puntos destacados:**\n- Claridad estratégica sobre volumen vacío.\n- Métricas de impacto: Ahorro de tiempo y ROI estimado.\n\nAplica estas tácticas y cuéntanos tus resultados.\n\nUn saludo,\nEquipo MultiContent AI`,
    },
    key_takeaways: [
      "Optimización del tiempo de redacción en más del 80%",
      "Estructura adaptada a los algoritmos de LinkedIn y X",
      "Formato listo para copiar y publicar en segundos",
    ],
  };
}
