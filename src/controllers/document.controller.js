import { DocumentRepository } from "../repositories/document.repo.js";

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
