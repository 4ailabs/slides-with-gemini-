
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SlideContent } from '../types';
import { checkRateLimit, recordApiRequest, getRemainingRequests, DEFAULT_RATE_LIMIT } from '../utils/rateLimiter';
import { retryWithBackoff } from '../utils/retryWithBackoff';

// Advertencia: La API key se expone en el bundle del cliente
// Para producción, considera usar un backend proxy
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set GEMINI_API_KEY in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const slideContentSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A short, impactful title for the slide. Should be 5-10 words.',
      },
      content: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'An array of 2-4 concise bullet points for the slide content. For a `title-only` layout, this can be an empty array.',
      },
      layout: {
        type: Type.STRING,
        description: "The layout for the slide. Choose from 'text-image', 'text-only', or 'title-only'.",
        enum: ['text-image', 'text-only', 'title-only'],
      },
      imagePrompt: {
        type: Type.STRING,
        description: 'A descriptive prompt for an AI image generator to create a relevant image. ONLY provide this for the `text-image` layout.',
      },
    },
    required: ['title', 'content', 'layout'],
  },
};

/**
 * Genera contenido de slides usando la API de Gemini
 * @param script - El script o tema del que generar las slides
 * @returns Promise que resuelve a un array de SlideContent
 * @throws Error si el script está vacío, es demasiado largo, o hay un error en la API
 */
export async function generateSlideContent(script: string): Promise<SlideContent[]> {
  if (!script || !script.trim()) {
    throw new Error('El script no puede estar vacío');
  }
  
  if (script.length > 10000) {
    throw new Error('El script es demasiado largo. Por favor, acórtalo a menos de 10,000 caracteres.');
  }

  // Rate limiting
  if (!checkRateLimit('generate-content')) {
    const remaining = getRemainingRequests('generate-content');
    throw new Error(`Límite de solicitudes alcanzado. Por favor espera un momento. Solicitudes restantes: ${remaining}`);
  }
  
  try {
    recordApiRequest('generate-content');

    // Usar retry con backoff para llamadas a la API
    const response = await retryWithBackoff(
      async () => {
        return await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Basándote en el siguiente guion o tema, genera una serie de diapositivas de presentación EN ESPAÑOL. Divide los puntos clave en diapositivas individuales. Guion: "${script.substring(0, 10000)}"`,
          config: {
            responseMimeType: "application/json",
            responseSchema: slideContentSchema,
            systemInstruction: "Eres un experto creador de presentaciones. Tu tarea es tomar un guion o tema dado y dividirlo en una serie de diapositivas concisas y atractivas EN ESPAÑOL. Para cada diapositiva, elige un diseño apropiado entre 'text-image', 'text-only' o 'title-only' para crear una presentación variada y profesional. Una presentación debe tener una mezcla de diseños. Para diapositivas 'text-image', DEBES proporcionar un prompt descriptivo para la imagen EN INGLÉS (ya que los generadores de imágenes funcionan mejor en inglés). Para otros diseños, no proporciones un prompt de imagen. TODO EL CONTENIDO DE LAS DIAPOSITIVAS (títulos y puntos) DEBE ESTAR EN ESPAÑOL.",
          },
        });
      },
      {
        maxRetries: 2,
        initialDelay: 1500,
        onRetry: (error, attempt) => {
          console.warn(`Reintentando generación de contenido (intento ${attempt}):`, error.message);
        },
      }
    );

    if (!response || !response.text) {
      throw new Error('La respuesta de la API está vacía');
    }

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error('La respuesta JSON está vacía');
    }
    
    const slideData = JSON.parse(jsonText);
    
    if (!Array.isArray(slideData)) {
      throw new Error('La respuesta no es un array de slides');
    }
    
    if (slideData.length === 0) {
      throw new Error('No se generaron slides. El script podría ser demasiado corto o ambiguo.');
    }
    
    return slideData as SlideContent[];
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error parsing JSON:", error);
      throw new Error("Error al parsear la respuesta de la IA. Por favor, intenta de nuevo.");
    }
    if (error instanceof Error && error.message.includes('API')) {
      throw error;
    }
    console.error("Error generating slide content:", error);
    throw new Error("Error al generar el contenido de las slides. Por favor, verifica tu conexión y API key.");
  }
}

/**
 * Genera una imagen para una slide usando la API de Gemini
 * @param prompt - El prompt descriptivo para generar la imagen
 * @returns Promise que resuelve a una URL de imagen en formato data URI
 * @throws Error si el prompt está vacío o hay un error en la API
 */
export async function generateImageForSlide(prompt: string): Promise<string> {
  if (!prompt || !prompt.trim()) {
    throw new Error('El prompt de imagen no puede estar vacío');
  }

  // Rate limiting más estricto para imágenes (más costosas)
  const imageRateLimit = { maxRequests: 5, windowMs: 60 * 1000 };
  if (!checkRateLimit('generate-image', imageRateLimit)) {
    const remaining = getRemainingRequests('generate-image', imageRateLimit);
    throw new Error(`Límite de generación de imágenes alcanzado. Solicitudes restantes: ${remaining}`);
  }
  
  try {
    recordApiRequest('generate-image');

    // Usar retry con backoff para generación de imágenes
    const response = await retryWithBackoff(
      async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: prompt.trim(),
              },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });
      },
      {
        maxRetries: 3,
        initialDelay: 2000,
        onRetry: (error, attempt) => {
          console.warn(`Reintentando generación de imagen (intento ${attempt}):`, error.message);
        },
      }
    );

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error('No se recibió respuesta de la API de imágenes');
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error('No se generó imagen en la respuesta.');

  } catch (error) {
    console.error("Error generating image:", error);
    
    // Si es un error conocido de API, relanzarlo
    if (error instanceof Error && (
      error.message.includes('API') || 
      error.message.includes('quota') ||
      error.message.includes('rate limit')
    )) {
      throw error;
    }
    
    // Return a placeholder image on failure
    console.warn('Using placeholder image due to generation error');
    return `https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 50))}/1280/720`;
  }
}
