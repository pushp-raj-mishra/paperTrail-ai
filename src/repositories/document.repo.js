import { db } from "../config/db.config.js";
import { documents } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export class DocumentRepository {
  //we are fetching all the documents of a user
  static async findAllByUser(userId) {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(documents.createdAt);
  }

  static async findByIdAndUser(id, userId) {
    const result = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));

    return result[0] || null;
  }

  static async deleteByIdAndUser(id, userId) {
    const result = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning({ id: documents.id });
    return result[0] || null;
  }

  static async create(userId, filename) {
    const result = await db
      .insert(documents)
      .values({ userId, filename, status: "PENDING" })
      .returning();
    return result[0];
  }

  static async updateStatus(id, status) {
    const result = await db
      .update(documents)
      .set({ status })
      .where(eq(documents.id, id))
      .returning();

    return result[0];
  }
}
