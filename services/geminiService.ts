
import { GoogleGenAI } from "@google/genai";

const apiKey = (process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Gemini AI client initialization skipped:", e);
  }
}

export async function generateRoomDescription(title: string, amenities: string[]): Promise<string> {
  if (!ai) return "Beautifully furnished room ready for your stay.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a compelling, short marketing description (max 2 sentences) for a rental room titled "${title}" with amenities: ${amenities.join(', ')}.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Beautifully furnished room ready for your stay.";
  }
}

export async function getRentalRecommendations(preferences: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a travel expert, suggest the best type of rental for someone who likes: ${preferences}. Be concise.`,
    });
    return response.text || "We have rooms for every taste.";
  } catch (error) {
    return "Check out our featured rooms.";
  }
}

export async function generateAvatarImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A professional, high-quality, minimalist profile avatar photo: ${prompt}. Artistic digital style, soft lighting, clean background, center-framed.`,
          },
        ],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
}
