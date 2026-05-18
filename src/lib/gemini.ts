import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompt";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
    maxOutputTokens: 8192,
  },
});
