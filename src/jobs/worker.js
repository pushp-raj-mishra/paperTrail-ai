import { Worker } from "bullmq";
import Redis from "ioredis";
import { extractText, getDocumentProxy } from "unpdf";
import { StorageService } from "../services/storage.service.js";
import { ChunkerService } from "../services/chunker.service.js";
import { EmbeddingService } from "../services/embedding.service.js";
import { db } from "../config/db.config.js";
import { documentChunks } from "../db/schema.js";
import { DocumentRepository } from "../repositories/document.repo.js";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6380", 10),
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "document-ingestion",
  async (job) => {
    const { documentId, userId, fileKey } = job.data;
    console.log(`\n[Job ${job.id}] Started processing document ${documentId}`);

    try {
      await DocumentRepository.updateStatus(documentId, "PROCESSING");
      const fileBuffer = await StorageService.retrieve(fileKey);

      const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
      const { text: rawText } = await extractText(pdf, { mergePages: true });

      console.log(
        `[Job ${job.id}] Successfully extracted ${rawText.length} characters.`,
      );

      console.log(`[Job ${job.id}] Chunking text...`);
      const chunks = ChunkerService.chunkText(rawText);

      console.log(
        `[Job ${job.id}] Generating embeddings for ${chunks.length} chunks...`,
      );
      const embeddings = await EmbeddingService.generateEmbeddings(chunks);

      console.log(`[Job ${job.id}] Saving to PostgreSQL...`);
      const recordsToInsert = chunks.map((chunk, index) => ({
        documentId,
        content: chunk,
        embedding: embeddings[index],
      }));

      await db.insert(documentChunks).values(recordsToInsert);

      await StorageService.delete(fileKey);
      await DocumentRepository.updateStatus(documentId, "COMPLETED");
      console.log(`[Job ${job.id}] Finished successfully.`);
    } catch (error) {
      console.error(`[Job ${job.id}] Failed:`, error.message);
      await DocumentRepository.updateStatus(documentId, "FAILED");
      throw error;
    }
  },
  { connection },
);
console.log("👷 Background Worker is listening for jobs...");
