import { DocumentRepository } from "../repositories/document.repo.js";
import { StorageService } from "../services/storage.service.js";
import { ingestionQueue } from "../jobs/queue.js";
import { RAGRepository } from "../repositories/rag.repo.js";
import { EmbeddingService } from "../services/embedding.service.js";
import { LLMService } from "../services/llm.service.js";

export const getDocuments = async (req, res) => {
  const docs = await DocumentRepository.findAllByUser(req.user.id);
  res.status(200).json({
    status: "success",
    data: docs,
  });
};

export const getDocumentById = async (req, res) => {
  const { id } = req.params;
  const doc = await DocumentRepository.findByIdAndUser(id, req.user.id);

  if (!doc) {
    return res.status(404).json({
      status: "error",
      message: "Document not found or you do not have permission",
    });
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
};

export const deleteDocument = async (req, res) => {
  const { id } = req.params;
  const deletedDoc = await DocumentRepository.deleteByIdAndUser(
    id,
    req.user.id,
  );

  if (!deletedDoc) {
    return res.status(404).json({
      status: "error",
      message: "document not found or you do not have permission to delete it",
    });
  }

  res.status(200).json({
    status: "success",
    message: `Document ${id} successfully deleted`,
  });
};

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No PDF file provided",
    });
  }

  const fileKey = await StorageService.save(
    req.file.buffer,
    req.file.originalname,
  );
  const newDoc = await DocumentRepository.create(
    req.user.id,
    req.file.originalname,
  );

  await ingestionQueue.add("process-pdf", {
    documentId: newDoc.id,
    userId: req.user.id,
    fileKey: fileKey,
  });

  res.status(202).json({
    status: "success",
    message: "Document uploaded successfully and is queued for AI processing",
    data: {
      id: newDoc.id,
      filename: newDoc.filename,
      status: newDoc.status,
    },
  });
};

export const askQuestion = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res
      .status(400)
      .json({ status: "error", message: "A search query is required." });
  }

  const queryVector = await EmbeddingService.embedQuery(query);

  const relevantChunks = await RAGRepository.findSimilarChunks(
    queryVector,
    req.user.id,
  );

  if (relevantChunks.length === 0) {
    return res.status(200).json({
      status: "success",
      data: {
        answer:
          "I couldn't find any documents to search through. Please upload a PDF first!",
        sources: [],
      },
    });
  }

  const answer = await LLMService.answerQuestion(query, relevantChunks);

  res.status(200).json({
    status: "success",
    data: {
      answer,
      sources: relevantChunks.map((chunk) => ({
        filename: chunk.filename,
        similarityScore: chunk.similarity.toFixed(3),
      })),
    },
  });
};
