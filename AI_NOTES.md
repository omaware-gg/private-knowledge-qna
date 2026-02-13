# AI Tools Used

### Primary Tool
- **Claude Sonnet 4.5** (via Cursor IDE)

## What AI Was Used For

### 1. Boilerplate Setup
- Initial Next.js project structure
- TypeScript configuration
- TailwindCSS setup
- Prisma schema initial draft
- Package.json dependencies

### 2. Initial Code Generation
- API route structure and error handling patterns
- Frontend page components with React hooks
- Utility library skeletons (chunking, embeddings, RAG)
- Database schema design suggestions

### 3. Later Iterations (with AI assistance)
- **pgvector integration**: Migration from manual cosine similarity to PostgreSQL pgvector (cosine distance `<=>`), raw SQL for vector insert/query
- **Recursive chunking**: Replaced fixed 800-char chunking with semantic-boundary splitter (paragraph → sentence → clause → word), max 4000 chars aligned to embedding model context window
- **Duplicate detection**: SHA-256 content hashing, unique index on `Document.contentHash`, 409 response with existing document name
- **Memory / OOM fixes**: Batched and one-at-a-time upload processing; retrieval only loads top-k from DB (no in-memory similarity over all chunks)
- **UI overhaul**: Glassmorphism design system, updated layout and pages (upload drag-and-drop, documents table, ask/sources, status)
- **Production readiness**: .gitignore (migrations tracked), postinstall/prisma generate, next.config for Vercel, README deployment section

### 4. Code Patterns
- Consistent error handling across API routes
- TypeScript type definitions
- Navigation and page structure

## What Was Manually Reviewed and Verified

### 1. Vector Search and Grounding
- **pgvector**: Confirmed cosine distance operator `<=>` and raw query return only top-k rows; no full-table load in Node
- **Prompt**: LLM prompt instructs answer strictly from context; fallback “I don't know based on the provided documents.”; temperature 0.1
- **Thresholds**: MAX_COSINE_DISTANCE 0.5 and MAX_DISTANCE_FOR_BEST 0.9 validated for relevance vs “no relevant info”

### 2. Chunking and Embedding Limits
- **Recursive splitter**: Separators ordered coarsest-to-finest; chunk size capped at 4000 chars (~1000 tokens) under text-embedding-3-small 8191-token limit
- **Overlap**: 200-char overlap preserved across chunk boundaries

### 3. Duplicate Detection
- **Hashing**: SHA-256 of raw file text (UTF-8); same content ⇒ same hash regardless of filename
- **Unique constraint**: Document.contentHash unique; duplicate upload returns 409 with existing document name

### 4. Error Handling
- **Review**: All error paths (missing env, DB, OpenAI, empty/invalid file, empty question, duplicate)
- **Verification**: Appropriate HTTP status codes and user-facing messages; upload page shows distinct duplicate (amber) vs error (red) state

### 5. Database Schema
- **Document**: id, name, contentHash (unique), createdAt, updatedAt; cascade to Chunk
- **Chunk**: id, documentId, content, embedding as `vector(1536)` (pgvector), createdAt
- **Migrations**: pgvector extension, contentHash column and unique index; migrations committed for Vercel

## Model Selection

### Embedding Model: `text-embedding-3-small`
- **Reason**: Cost-effective, 8191-token context window
- **Performance**: 1536 dimensions, good quality for semantic search
- **Tradeoff**: Lower cost vs. `text-embedding-3-large`

### Completion Model: `gpt-4o-mini`
- **Reason**: Balanced cost and performance
- **Performance**: Fast, good instruction following
- **Tradeoff**: Lower cost vs. `gpt-4o`

## Known Limitations of LLM-Generated Code

1. **Runtime testing**: No automated test suite; manual verification only
2. **Edge cases**: e.g. very large files, concurrent uploads, rate limits
3. **Security**: Basic validation; production may need stricter checks and runtime validation (e.g. Zod)
4. **Vercel**: Serverless timeout (10s Hobby) may affect large uploads; Pro or background jobs for heavy workloads

## Manual Improvements Made

1. **Recursive chunking**: Semantic boundaries and size limit within embedding context window
2. **pgvector**: Similarity in DB; no in-app full-chunk scan; avoids OOM
3. **Upload memory**: One chunk embedded/inserted at a time; no accumulation of all embeddings in memory
4. **Duplicate detection**: SHA-256 + unique index; clear 409 and UI messaging
5. **UI/UX**: Glassmorphism, drag-and-drop upload, status indicators, source attribution
6. **Production**: Migrations in repo, postinstall/build Prisma generate, README and .env.example for Vercel
