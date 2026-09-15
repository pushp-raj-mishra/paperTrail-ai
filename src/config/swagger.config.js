export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "paperTrail AI API",
    version: "1.0.0",
    description:
      "API documentation for the AI-powered document ingestion and RAG pipeline.",
  },
  servers: [
    {
      url: "https://papertrail-ai-d1pu.onrender.com",
      description: "Production Server",
    },
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Check API Health",
        tags: ["System"],
        responses: {
          200: { description: "API is running smoothly." },
        },
      },
    },
    "/api/v1/documents": {
      get: {
        summary: "Get all documents",
        tags: ["Documents"],
        responses: {
          200: { description: "List of documents belonging to the user." },
        },
      },
      post: {
        summary: "Upload a new PDF",
        tags: ["Documents"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "The PDF file to upload and process.",
                  },
                },
              },
            },
          },
        },
        responses: {
          202: { description: "Document uploaded and queued for processing." },
        },
      },
    },
    "/api/v1/documents/{id}": {
      get: {
        summary: "Get a document by ID",
        tags: ["Documents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "Document details." },
          404: { description: "Document not found." },
        },
      },
      delete: {
        summary: "Delete a document",
        tags: ["Documents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "Document deleted successfully." },
        },
      },
    },
    "/api/v1/documents/ask": {
      post: {
        summary: "Ask a question using AI (RAG)",
        tags: ["AI Search"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    example: "What is the OSI model?",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "The generated AI answer and source documents." },
        },
      },
    },
  },
};
