
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SlideContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
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

export async function generateSlideContent(script: string): Promise<SlideContent[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following script, generate a series of presentation slides. Break down the key points into individual slides. Script: "${script}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: slideContentSchema,
        systemInstruction: "You are an expert presentation creator. Your task is to take a given script or topic and break it down into a series of concise, engaging slides. For each slide, choose an appropriate layout from 'text-image', 'text-only', or 'title-only' to create a varied and professional presentation. A presentation should have a mix of layouts. For 'text-image' slides, you MUST provide a descriptive image prompt. For other layouts, do not provide an image prompt.",
      },
    });

    const jsonText = response.text.trim();
    const slideData = JSON.parse(jsonText);
    return slideData as SlideContent[];
  } catch (error) {
    console.error("Error generating slide content:", error);
    throw new Error("Failed to parse slide content from AI response. The model may have returned an invalid format.");
  }
}

export async function generateImageForSlide(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error('No image was generated from the response.');

  } catch (error) {
    console.error("Error generating image:", error);
    // Return a placeholder image on failure
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1280/720`;
  }
}
