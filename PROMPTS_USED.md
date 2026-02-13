# PROMPTS_USED.md

## 1. System Architecture Planning

**Prompt Used:**

> Design a clean architecture for a RAG-based document Q&A system using Next.js App Router, PostgreSQL, and Prisma. Keep it minimal but production-aware.

**Why This Prompt Was Used:**
To validate high-level architectural decisions before implementation.

**Manual Decisions Taken:**
- Retrieval logic isolated inside `/lib` to separate business logic from API routes
- Avoided vector databases (e.g., pgvector) to manually implement similarity logic
- Kept architecture simple (no background workers, queues, or caching layers)
- Ensured modularity between upload, retrieval, and health-check flows

The final structure reflects intentional modular design rather than generated scaffolding.

---

## 2. Database Modeling Strategy (Prisma)

**Prompt Used:**

> Suggest a normalised relational schema for storing documents and embedding chunks in PostgreSQL using Prisma.

**Final Implemented Schema:**

### Document Model

- `id` → `String @id @default(uuid())`
- `name` → `String`
- `createdAt` → `DateTime @default(now())`
- `updatedAt` → `DateTime @updatedAt`
- `chunks` → One-to-many relation with `Chunk`

**Index:**

- `@@index([createdAt])`

Used to allow efficient chronological sorting.

---

### Chunk Model

- `id` → `String @id @default(uuid())`
- `documentId` → Foreign key
- `document` → Relation with `onDelete: Cascade`
- `content` → `String @db.Text`
- `embedding` → `Float[]`
- `createdAt` → `DateTime @default(now())`

**Indexes:**

- `@@index([documentId])`

**Design Decisions:**

- Used `Float[]` to store embeddings directly in PostgreSQL.
- Stored chunk content as `@db.Text` to support larger text bodies.
- Enabled `onDelete: Cascade` so deleting a document removes associated chunks.
- Added index on `documentId` for efficient chunk retrieval per document.

**Manual Validation:**
- Verified migration SQL output
- Confirmed relational integrity in Prisma Studio
- Ensured cascade deletion works correctly

Avoided:
- JSON-based storage
- Storing full documents without chunking
- Embedding computation inside SQL

---

## 3. Cosine Similarity Implementation

**Prompt Used:**

> Implement cosine similarity in TypeScript without using external libraries.

**Reason:**
To demonstrate understanding of vector similarity computation rather than delegating to pgvector.

**Manual Verification:**
- Validated vector length consistency
- Verified normalisation formula
- Confirmed correct descending similarity sort
- Logged similarity scores during retrieval tuning

Similarity is computed at the application layer, not the database layer.

---

## 4. Document Chunking Strategy

**Prompt Used:**

> Propose a chunking strategy for RAG that avoids breaking words and keeps chunk size around 800 characters.

**Final Strategy Implemented:**
- Approx. 700–900 character chunks
- Word-boundary safe splitting
- Trimmed whitespace
- Stored chunks independently with embeddings

**Why ~800 Characters?**
- Balances context size vs embedding granularity
- Improves semantic specificity
- Reduces token cost per embedding

---

## 5. Retrieval Logic Design

**Prompt Used:**

> Suggest a clean top-k retrieval approach using cosine similarity and threshold filtering.

**Final Retrieval Pipeline:**

1. Generate question embedding
2. Retrieve all chunks via Prisma
3. Compute cosine similarity in application layer
4. Sort descending by similarity
5. Select top 3 chunks
6. Apply similarity threshold (0.5)
7. Provide filtered chunks to LLM as context

**Threshold Tuning:**
- Initially tested at 0.6 (too strict)
- Adjusted to 0.5 after empirical testing
- Validated using:
  - Direct matches
  - Semantic variations
  - Irrelevant queries

Threshold tuning was done manually based on observed precision vs recall tradeoffs.

---

## 6. Prompt Engineering for Grounded Responses

**Prompt Used:**

> Draft a system prompt that forces the LLM to answer strictly using provided context and avoids hallucination.

**Final Prompt Characteristics:**
- Explicit grounding instruction
- Required fallback response:
  “I don't know based on the provided documents.”
- Temperature set to 0.1 for deterministic output
- Context clearly separated from user query

This reduces hallucination risk and ensures answer traceability.

---

## 7. Error Handling Patterns

**Prompt Used:**

> Suggest robust error handling patterns for Next.js API routes using TypeScript.

**Manual Testing Performed:**
- Missing `OPENAI_API_KEY`
- Missing `DATABASE_URL`
- Empty file upload
- Invalid file type
- No documents available
- Similarity below threshold
- OpenAI API failure simulation
- Temporary database connection interruption

All API routes return appropriate HTTP status codes.

---