import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export class StorageService {
  static async save(fileBuffer, originalName) {
    const safeName = originalName.replace(/\s+/g, "-");
    const fileName = `${randomUUID()}-${safeName}`;

    //saving to a folder tmp
    const uploadPath = path.join(process.cwd(), "tmp", fileName);

    //ensuring tmp exists before writing
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, fileBuffer);

    //returning filepath for worker
    return uploadPath;
  }

  static async retrieve(fileKey) {
    return await fs.readFile(fileKey);
  }

  static async delete(fileKey) {
    return await fs.unlink(fileKey).catch(() => null);
  }
}
