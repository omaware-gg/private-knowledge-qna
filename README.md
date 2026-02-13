# Knowledge Q&A

**Private Knowledge Workspace** — Upload `.txt` documents, ask questions, get answers grounded in your content using a RAG (Retrieval-Augmented Generation) pipeline.

---

## Features

- **Upload** — Drag-and-drop or browse; `.txt` only, max 1 MB. Duplicate content is detected (SHA-256) and rejected.
- **Chunking** — Recursive splitter on semantic boundaries (paragraphs → sentences → words); chunks capped at ~4000 chars to fit the embedding model.
- **Embeddings** — OpenAI `text-embedding-3-small`; stored in PostgreSQL with **pgvector** for fast similarity search.
- **Ask** — Question is embedded; top 3 relevant chunks are retrieved via cosine distance in the DB, then sent to **GPT-4o-mini** with a grounding prompt. Answer + source chunks returned.
- **UI** — Glassmorphism design: home, upload, documents list, ask, and system status pages.
- **Production-ready** — Prisma migrations committed, `postinstall` for Vercel, README and `.env.example` for deployment.

---

## Tech Stack

| Layer        | Technology |
|-------------|------------|
| Framework   | Next.js 14 (App Router) |
| Language    | TypeScript (strict) |
| Database    | PostgreSQL + **pgvector** |
| ORM         | Prisma |
| AI          | OpenAI (text-embedding-3-small, gpt-4o-mini) |
| Styling     | TailwindCSS |

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** with the [pgvector](https://github.com/pgvector/pgvector) extension (e.g. [Neon](https://neon.tech))
- **OpenAI API key**

---

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `OPENAI_API_KEY` — your OpenAI API key
   - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname?sslmode=require`)

3. **Database** (creates tables and applies migrations; requires pgvector)
   ```bash
   npx prisma migrate dev
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. **Push to GitHub**  
   Ensure `prisma/migrations/` is committed (do **not** ignore it in `.gitignore`).

2. **Import project**  
   [vercel.com/new](https://vercel.com/new) → Import your repo. Framework: **Next.js** (auto-detected).

3. **Environment variables** (Vercel project → Settings → Environment Variables)
   - `DATABASE_URL` — production PostgreSQL URL (e.g. Neon pooled connection with `?sslmode=require`)
   - `OPENAI_API_KEY` — your OpenAI API key

4. **Run migrations** against the production database once:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```
   You can run this locally or in a CI step; Vercel does not run migrations automatically.

5. **Deploy**  
   Vercel runs `npm install` → `postinstall` (`prisma generate`) → `npm run build`. No extra config needed.

---

## Scripts

| Command         | Description |
|-----------------|-------------|
| `npm run dev`   | Start Next.js dev server |
| `npm run build` | Run `prisma generate` then `next build` |
| `npm run start` | Start production server (after `build`) |
| `npm run lint`  | Run ESLint |

`postinstall` runs `prisma generate` after `npm install` (used by Vercel).

---

## Project Structure

```
app/
  api/
    upload/route.ts     # Upload file → chunk → embed → store (duplicate check via hash)
    ask/route.ts        # RAG: embed question → pgvector top-k → LLM → answer + sources
    documents/route.ts  # List documents with chunk counts
    status/route.ts     # Health: DB + OpenAI embedding + completion
  upload/page.tsx       # Upload UI (drag-and-drop, duplicate/error/success)
  documents/page.tsx   # Documents table
  ask/page.tsx         # Question form + answer + source chunks
  status/page.tsx      # System status
  page.tsx             # Home
  layout.tsx           # Root layout + nav
  globals.css          # Glassmorphism styles

lib/
  prisma.ts            # Prisma client singleton
  chunking.ts          # Recursive text splitter (semantic boundaries, max 4000 chars)
  embeddings.ts        # OpenAI text-embedding-3-small
  rag.ts               # queryRAG: pgvector search + GPT-4o-mini with grounding prompt

prisma/
  schema.prisma        # Document (id, name, contentHash), Chunk (content, vector(1536))
  migrations/          # Applied with prisma migrate dev / migrate deploy
```

---

## Architecture Notes

- **pgvector** — Similarity is computed in the database (`ORDER BY embedding <=> $queryVector LIMIT 3`). The app never loads all chunks; avoids OOM and scales.
- **Recursive chunking** — Splits on paragraph, then sentence, then word boundaries. Keeps chunks under the embedding model’s context window and improves retrieval quality.
- **Duplicate detection** — SHA-256 of file content stored as `Document.contentHash` (unique). Re-uploading the same content returns 409 and the existing document name.
- **Grounding** — The LLM is instructed to answer only from the provided chunks and to say “I don’t know based on the provided documents.” when the answer isn’t in the context.

---