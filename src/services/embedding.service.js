import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { format } from "morgan";

const ai = new GoogleGenAI({});

export class EmbeddingService {
  static async generateEmbeddings(chunks) {
    console.log(
      `[Gemini] Generating real vectors for ${chunks.length} chunks...`,
    );

    const formattedContents = chunks.map((chunk) => ({
      parts: [{ text: `title: none | text: ${chunk}` }],
    }));

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: formattedContents,
      config: {
        outputDimensionality: 1536,
      },
    });
    return response.embeddings.map((embedding) => embedding.values);
  }
}
