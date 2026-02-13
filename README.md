# Knowledge Q&A - Private Knowledge Workspace

A web application that allows users to upload text documents, ask questions, and receive answers grounded in the uploaded content using a RAG (Retrieval-Augmented Generation) pipeline.

## Overview

1. **Upload Flow**: Users upload `.txt` files which are:
   - Validated (size, format, content, duplicate detection via SHA-256)
   - Recursively split into semantically meaningful chunks
   - Embedded using OpenAI's `text-embedding-3-small` model
   - Stored in PostgreSQL with pgvector for vector similarity search

2. **Question Flow**: When users ask questions:
   - The question is embedded
   - Top 3 most relevant chunks are found via pgvector cosine distance in the database
   - These chunks are sent as context to GPT-4o-mini
   - The answer is returned with source attribution (document name + chunk content)

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **PostgreSQL** + **pgvector** (vector similarity search)
- **Prisma ORM**
- **OpenAI API** (embeddings + completions)
- **TailwindCSS** (glassmorphism UI)

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** with **pgvector** extension (e.g. [Neon](https://neon.tech) has pgvector built-in)
- **OpenAI API key**

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your:
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (PostgreSQL connection string)

3. **Set up the database** (PostgreSQL must have [pgvector](https://github.com/pgvector/pgvector) available):
   ```bash
   npx prisma migrate dev
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. **Push to GitHub** (ensure `prisma/migrations/` is committed).

2. **Import in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and import your repository.
   - Framework preset: **Next.js** (auto-detected).

3. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL` — your PostgreSQL connection string (e.g. Neon pooled URL with `?sslmode=require`)
   - `OPENAI_API_KEY` — your OpenAI API key

4. **Apply migrations** to your production database:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```
   Or run this from Vercel CLI / a CI step.

5. **Deploy** — Vercel will run `npm install` → `postinstall` (prisma generate) → `next build` automatically.

> **Note**: Vercel serverless functions have a 10-second timeout on the Hobby plan. Large file uploads with many chunks may need Vercel Pro (60s timeout) or a background job setup.

## What Is Implemented

- Document upload with validation (.txt files, max 1MB)
- Duplicate detection via SHA-256 content hashing
- Recursive text chunking (paragraph → sentence → word boundaries)
- Chunk sizes tuned to embedding model context window (4000 chars / ~1000 tokens)
- Embedding generation using OpenAI text-embedding-3-small
- Vector similarity search with pgvector (cosine distance in DB)
- Question answering with RAG pipeline (GPT-4o-mini)
- Source attribution (document name + chunk content)
- Documents listing page
- System status/health check page
- Glassmorphism UI with TailwindCSS
- TypeScript with strict types

## Project Structure

```
app/
  api/
    upload/route.ts    - File upload + chunking + embedding
    ask/route.ts       - RAG question answering
    documents/route.ts - List documents
    status/route.ts    - Health checks
  upload/page.tsx      - Upload page (drag & drop)
  documents/page.tsx   - Documents listing
  ask/page.tsx         - Question page
  status/page.tsx      - Status page
  page.tsx             - Home page
  layout.tsx           - Root layout with navigation
  globals.css          - Glassmorphism design system

lib/
  prisma.ts            - Prisma client singleton
  chunking.ts          - Recursive text splitter
  embeddings.ts        - OpenAI embedding generation
  rag.ts               - RAG pipeline (pgvector search + LLM)

prisma/
  schema.prisma        - Database schema (Document, Chunk with vector)
  migrations/          - Database migrations
```

## Architecture Decisions

### Why pgvector?
pgvector provides vector similarity search inside PostgreSQL. The DB computes cosine distance and returns only the top-k chunks, so the app never loads all embeddings into memory.

### Why recursive chunking?
Splits on semantic boundaries (paragraphs → sentences → words) rather than fixed character windows. Produces fewer, more meaningful chunks that stay within the embedding model's context window.

### Why SHA-256 for duplicate detection?
Fast O(1) lookup via a unique index. Detects identical content even if the filename differs. No embedding calls wasted on duplicates.
