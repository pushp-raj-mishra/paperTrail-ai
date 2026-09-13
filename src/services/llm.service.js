import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({});

export class LLMService {
  static async answerQuestion(query, contextChunks) {
    console.log(
      `[Gemini] : Generating answer from ${contextChunks.length} context chunks...`,
    );

    const contextText = contextChunks
      .map((chunk) => chunk.content)
      .join("\n\n---\n\n");

    const prompt = `You are an intelligent document assistant. Answer the user's question using ONLY the provided context. 
                   If the context does not contain the answer, politely state that you do not have enough information. Do not hallucinate outside knowledge.

        Context Information:
        ${contextText}

        User Question: ${query}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });
    return response.text;
  }
}
