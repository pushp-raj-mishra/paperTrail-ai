import { Router } from "express";
import { z } from "zod";
import {
  getDocuments,
  getDocumentById,
  deleteDocument,
} from "../controllers/document.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

const documentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("The document ID must be a valid uuid"),
  }),
});

router.use(requireAuth);

router.get("/", getDocuments);

router.get("/:id", validate(documentIdSchema), getDocumentById);

router.delete("/:id", validate(documentIdSchema), deleteDocument);

export default router;
