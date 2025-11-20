import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let aiClient: GoogleGenAI | null = null;

export const initializeGenAI = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing from environment variables.");
    return;
  }
  aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateResponse = async (userMessage: string): Promise<string> => {
  if (!aiClient) {
    initializeGenAI();
    if (!aiClient) {
        return "I'm sorry, but I can't connect to my brain right now (API Key missing). Please try again later or contact Konrad directly.";
    }
  }

  try {
    const model = aiClient.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "I had a thought, but it slipped away. Can you ask again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble processing that right now. I might be overwhelmed with requests!";
  }
};