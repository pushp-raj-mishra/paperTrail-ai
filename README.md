# paperTrail AI

paperTrail AI is a document ingestion and retrieval-augmented generation (RAG) API. Users upload PDFs, the worker extracts and chunks text, embeddings are stored in PostgreSQL with pgvector, and questions are answered against the indexed document corpus.

## Architecture

```mermaid
flowchart LR
  Client["API Client"] --> API["Express API"]
  API --> DB["PostgreSQL + pgvector"]
  API --> Redis["Redis Queue"]
  Redis --> Worker["BullMQ Worker"]
  Worker --> Storage["Local tmp storage"]
  Worker --> Gemini["Google Gemini Embeddings + LLM"]
  Worker --> DB
  API --> Swagger["Swagger UI"]
```

### Main runtime pieces

- `src/app.js` wires Express, CORS, logging, Swagger, routes, and error handling.
- `src/server.js` starts the HTTP server.
- `src/routes/document.js` exposes the authenticated document and RAG endpoints.
- `src/controllers/document.controller.js` coordinates upload, query, delete, and retrieval flows.
- `src/jobs/worker.js` processes queued PDF ingestion jobs.
- `src/repositories/*.js` encapsulate database access.
- `src/services/*.js` provide storage, chunking, embedding, and LLM behavior.

## Data Flow

1. A client uploads a PDF to `POST /api/v1/documents`.
2. The API stores the file under `tmp/` and creates a document row with status `PENDING`.
3. A BullMQ job is enqueued in Redis.
4. The worker pulls the job, extracts PDF text, chunks it, generates embeddings, and stores chunks in PostgreSQL.
5. The document status is updated to `COMPLETED` or `FAILED`.
6. A question sent to `POST /api/v1/documents/ask` is embedded, matched against stored chunks with pgvector similarity search, and answered by Gemini.

## Docker Initialization

The Docker setup uses three containers:

- `db`: PostgreSQL 16 with pgvector
- `redis`: BullMQ backing store
- `api` and `worker`: Node.js application containers

On first database startup, the init SQL script:

- enables `pgcrypto` for `gen_random_uuid()`
- enables `vector` for pgvector columns
- creates the schema
- seeds the placeholder user used by the current auth middleware stub

If you already started the database volume before these fixes, recreate it so the init script runs again:

```bash
docker compose down -v
docker compose up --build
```

## Local Setup

### Requirements

- Node.js 20+
- PostgreSQL 16 with pgvector, or Docker
- Redis 7, or Docker
- A `GEMINI_API_KEY`

### Environment variables

Create a `.env` file with at least:

```env
PORT=3000
DATABASE_URL=postgres://admin:rootpassword@localhost:5433/papertrail_db
REDIS_HOST=localhost
REDIS_PORT=6380
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Install and run

```bash
npm install
npm run start
```

For Docker:

```bash
docker compose up --build
```

## API Surface

### System

- `GET /health` returns service health.
- `GET /api-docs` opens Swagger UI.

### Documents

- `POST /api/v1/documents` uploads a PDF and queues ingestion.
- `GET /api/v1/documents` lists the authenticated user’s documents.
- `GET /api/v1/documents/:id` fetches one document.
- `DELETE /api/v1/documents/:id` deletes a document.
- `POST /api/v1/documents/ask` asks a question against indexed documents.

## Repository Structure

```text
src/
  app.js                Express app wiring
  server.js             HTTP server startup
  config/               DB and Swagger config
  controllers/          Route handlers
  db/                   Schema and migrations
  jobs/                 BullMQ queue and worker
  middlewares/          Auth, upload, validation, error handling
  repositories/         Database access layer
  routes/               API route definitions
  services/             Storage, chunking, embeddings, LLM helpers
tmp/                    Temporary uploaded PDFs
```

## Notes

- Authentication is currently a stub in `src/middlewares/auth.middleware.js`; it injects a fixed demo user so the rest of the stack can run.
- The worker expects the Gemini API key to be present in both the API and worker containers.
- The app does not automatically run Drizzle migrations at runtime; the Docker bootstrap now seeds the schema on first database initialization.
