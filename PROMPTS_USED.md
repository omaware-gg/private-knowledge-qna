# PROMPTS_USED.md

This file records the main prompts and design decisions that shaped the Knowledge Q&A application, including later changes (pgvector, recursive chunking, duplicate detection, UI, production).

---

## 1. System Architecture Planning

**Prompt Used:**

> Design a clean architecture for a RAG-based document Q&A system using Next.js App Router, PostgreSQL, and Prisma. Keep it minimal but production-aware.

**Evolution:**
- Initial choice was manual cosine similarity in the app layer.
- **Later**: Switched to **pgvector** for similarity in the database (avoids loading all chunks, scales better, fixes OOM).
- Retrieval logic remains in `/lib` (e.g. `lib/rag.ts`); upload, documents, and status flows stay modular.
- No background workers or queues; upload is synchronous (Vercel serverless timeout applies).

---

## 2. Database Modeling (Prisma)

**Prompt Used:**

> Suggest a normalised relational schema for storing documents and embedding chunks in PostgreSQL using Prisma.

**Current Schema:**

### Document

- `id` → `String @id @default(uuid())`
- `name` → `String`
- `contentHash` → `String @unique` (SHA-256 hex of file content for duplicate detection)
- `createdAt` → `DateTime @default(now())`
- `updatedAt` → `DateTime @updatedAt`
- `chunks` → One-to-many relation with `Chunk`

**Index:** `@@index([createdAt])`

### Chunk

- `id` → `String @id @default(uuid())`
- `documentId` → Foreign key to Document
- `document` → Relation with `onDelete: Cascade`
- `content` → `String @db.Text`
- `embedding` → `Unsupported("vector(1536)")` (pgvector)
- `createdAt` → `DateTime @default(now())`

**Index:** `@@index([documentId])`

**Design Decisions:**
- **pgvector**: `vector(1536)` for embeddings; extension enabled in datasource; insert/query via `$executeRaw` / `$queryRaw` with `pgvector.toSql()`.
- **contentHash**: Enables duplicate detection; unique so same content cannot be stored twice.
- Cascade delete so removing a document removes its chunks.
- Migrations are committed (no longer gitignored) for Vercel and production deploys.

---

## 3. Vector Similarity (pgvector)

**Context:**  
Similarity was initially implemented in TypeScript (cosine similarity in `lib/similarity.ts`). That was replaced by **pgvector** for performance and to avoid OOM when the corpus grew.

**Current Approach:**
- **Storage**: Chunk embeddings stored as `vector(1536)` in PostgreSQL.
- **Query**: Single raw SQL query using cosine distance operator `<=>`:
  - `ORDER BY c.embedding <=> $queryVector LIMIT 3`
  - Only the top 3 rows (content + document name + distance) are returned.
- **Filtering**: Rows with `distance > 0.5` dropped; if best `distance > 0.9`, return “No relevant information found.”
- **Library**: `pgvector` npm package for `toSql(embedding)` and typed raw queries.

Manual cosine similarity is no longer used; `lib/similarity.ts` was removed.

---

## 4. Chunking Strategy

**Earlier Prompt:**

> Propose a chunking strategy for RAG that avoids breaking words and keeps chunk size around 800 characters.

**Current Strategy (Recursive Splitter):**
- **Separators** (coarsest to finest): `\n\n` → `\n` → `. ` → `! ` → `? ` → `; ` → `, ` → ` ` → character.
- **Max chunk size**: 4000 characters (~1000 tokens), under `text-embedding-3-small` 8191-token limit.
- **Overlap**: 200 characters to preserve context across boundaries.
- **Logic**: Split on first separator that appears; merge segments up to max size; recurse with finer separators when a segment exceeds max.

**Rationale:**  
Fewer, semantically coherent chunks; fewer embeddings per document; lower memory and API cost; chunks stay within model context.

---

## 5. Retrieval and RAG Pipeline

**Earlier Prompt:**

> Suggest a clean top-k retrieval approach using cosine similarity and threshold filtering.

**Current Pipeline:**

1. Generate question embedding (OpenAI `text-embedding-3-small`).
2. Run pgvector query: `ORDER BY embedding <=> $queryVector LIMIT 3`, join Document for name.
3. Filter rows: keep only `distance <= 0.5`; if best `distance > 0.9`, return “No relevant information found.”
4. Build context string from kept chunks (joined with `\n\n---\n\n`).
5. Call GPT-4o-mini with grounding prompt (context + question; answer only from context).
6. Return answer and sources (document name + chunk content).

**Thresholds:**  
- `MAX_COSINE_DISTANCE = 0.5` (equivalent to similarity ≥ 0.5).  
- `MAX_DISTANCE_FOR_BEST = 0.9` (reject when best match is too weak).

---

## 6. Prompt Engineering for Grounded Responses

**Prompt Used:**

> Draft a system prompt that forces the LLM to answer strictly using provided context and avoids hallucination.

**Final Prompt (in code):**

```
You are a precise assistant. Answer strictly using the provided context.
If the answer is not contained in the context, respond with:
"I don't know based on the provided documents."

Context:
<chunks>

Question: <question>

Answer:
```

**Settings:**  
- Temperature 0.1.  
- Single user message containing context + question + instruction.  
- Same structure used when zero or low-relevance chunks are found (predefined “no documents” / “no relevant information” responses without calling the LLM).

---

## 7. Duplicate Detection

**Approach (no specific prompt; implementation choice):**
- Compute **SHA-256** of the raw file text (UTF-8) before chunking.
- Store as `Document.contentHash` with a **unique** constraint.
- Before creating a new document, `findUnique({ where: { contentHash } })`.
- If found: return **409 Conflict** with `{ duplicate: true, existingDocument: { id, name } }`; no chunks or embeddings created.
- Frontend shows an amber “Duplicate detected” message with the existing document name.

**Rationale:**  
Deterministic, fast; avoids duplicate content and redundant embedding cost.

---

## 8. Error Handling and Production

**Prompt Used (earlier):**

> Suggest robust error handling patterns for Next.js API routes using TypeScript.

**Current Practice:**
- Validation: file presence, size, type (.txt), non-empty content; question non-empty.
- Duplicate: 409 with structured body.
- Server errors: 500 with message; no stack in response.
- Health checks: `/api/status` probes DB and OpenAI (embedding + completion) and returns 503 when degraded.

**Production / Vercel:**
- `postinstall` and `build` run `prisma generate`.
- Migrations committed; `prisma migrate deploy` run against production DB.
- `next.config.mjs`: `serverExternalPackages: ['@prisma/client', 'prisma']` for Vercel serverless.
- `.env.example` documents `OPENAI_API_KEY` and `DATABASE_URL`; README includes local and Vercel deployment steps.

---

## 9. UI and UX

**Later work (glassmorphism and flow):**
- **Design**: Glassmorphism (blur, translucent panels, gradient background, accent colors).
- **Pages**: Home (hero + feature cards), Upload (drag-and-drop, duplicate/error/success states), Documents (table), Ask (textarea + answer + sources), Status (service health with badges).
- **Components**: Shared nav, glass cards, primary button, input-glass, alert-error / alert-success, duplicate warning (amber).
- **Accessibility**: Semantic HTML, labels, focus states; no major a11y audit documented.

All prompts and decisions above reflect the current codebase as of the last update.
