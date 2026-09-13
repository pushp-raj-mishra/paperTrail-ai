import { db } from "../config/db.config.js";
import { documentChunks, documents } from "../db/schema.js";
import { cosineDistance, desc, sql, eq } from "drizzle-orm";

export class RAGRepository {
  static async findSimilarChunks(queryVector, userId, limit = 5) {
    const similarity = sql`1-(${cosineDistance(documentChunks.embedding, queryVector)})`;

    return await db
      .select({
        content: documentChunks.content,
        similarity: similarity,
        documentId: documents.id,
        filename: documents.filename,
      })
      .from(documentChunks)
      .innerJoin(documents, eq(documentChunks.documentId, documents.id))
      .where(eq(documents.userId, userId))
      .orderBy(desc(similarity))
      .limit(limit);
  }
}
