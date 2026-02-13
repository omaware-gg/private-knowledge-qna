# Knowledge Q&A - Private Knowledge Workspace

A web application that allows users to upload text documents, ask questions, and receive answers grounded in the uploaded content using a RAG (Retrieval-Augmented Generation) pipeline.

## Overview

This application implements a simple RAG pipeline:

1. **Upload Flow**: Users upload `.txt` files which are:
   - Validated (size, format, content)
   - Split into chunks (~800 characters, word-safe)
   - Embedded using OpenAI's `text-embedding-3-small` model
   - Stored in PostgreSQL with embeddings as float arrays

2. **Question Flow**: When users ask questions:
   - The question is embedded
   - Cosine similarity is computed against all document chunks (in Node.js, not SQL)
   - Top 3 most relevant chunks are retrieved
   - These chunks are sent as context to an LLM (GPT-4o-mini)
   - The answer is returned with source attribution (document name and exact chunk)

## Architecture Decisions

### Why PostgreSQL?
PostgreSQL provides robust relational data management, ACID compliance, and excellent support for array types (used for embeddings). It's a mature, production-ready database that handles the document and chunk relationships cleanly.

### Why Prisma?
Prisma offers type-safe database access, excellent TypeScript integration, and simplifies migrations. It provides a clean abstraction over raw SQL while maintaining flexibility.

### Why Manual Similarity Instead of pgvector?
For this assignment, implementing cosine similarity manually demonstrates understanding of the core RAG concepts. pgvector would be the production choice for SCALE, but manual implementation shows:
- Understanding of vector similarity
- Ability to implement algorithms
- Awareness of when to use specialized tools vs. simple solutions

### Tradeoffs
- **Manual similarity**: Simple and educational, but slower at scale (O(n) for each query)
- **Float arrays in PostgreSQL**: Works well for small datasets, but pgvector would be better for production scale
- **Synchronous embedding generation**: Simple but could benefit from background jobs for large uploads
- **In-memory similarity**: Fine for small document sets, but would need optimization for thousands of documents

## How to Run

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

3. **Set up the database**:
   ```bash
   npx prisma migrate dev
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## What Is Implemented

- ✅ Document upload with validation (.txt files, max 1MB)
- ✅ Text chunking (~800 chars, word-safe splits)
- ✅ Embedding generation using OpenAI
- ✅ Document storage with Prisma/PostgreSQL
- ✅ Question answering with RAG pipeline
- ✅ Cosine similarity computation (manual implementation)
- ✅ Source attribution (document name + chunk content)
- ✅ Documents listing page
- ✅ System status/health check page
- ✅ Error handling for all major failure points
- ✅ TypeScript with strict types
- ✅ Clean, minimal UI with TailwindCSS

## What Is Not Implemented

- ❌ Authentication/authorization
- ❌ Production deployment configuration
- ❌ Background job processing for large uploads
- ❌ Rate limiting
- ❌ Streaming responses
- ❌ Large-scale optimization (pgvector, caching)
- ❌ Document deletion
- ❌ File type support beyond .txt

## Future Improvements

1. **pgvector**: Replace manual similarity with pgvector for better performance at scale
2. **Background Jobs**: Use a job queue (e.g., BullMQ) for async embedding generation on upload
3. **Caching**: Cache embeddings and similarity results for frequently asked questions
4. **Multi-user**: Add authentication and user-specific document workspaces
5. **More File Types**: Support PDF, DOCX, Markdown, etc.
6. **Chunk Management**: Allow users to view/edit chunks, adjust chunking strategy
7. **Query History**: Store and display previous questions/answers
8. **Better Chunking**: Implement semantic chunking or sliding window strategies
9. **Streaming**: Stream LLM responses for better UX
10. **Rate Limiting**: Prevent abuse with rate limits on API endpoints

## Project Structure

```
/app
  /api
    /upload      - File upload endpoint
    /documents   - List documents endpoint
    /ask         - Question answering endpoint
    /status      - Health check endpoint
  /upload        - Upload page
  /documents     - Documents listing page
  /ask           - Question page
  /status        - Status page
  page.tsx       - Home page
  layout.tsx     - Root layout with navigation

/lib
  prisma.ts      - Prisma client singleton
  chunking.ts    - Text chunking logic
  embeddings.ts  - OpenAI embedding generation
  similarity.ts  - Cosine similarity computation
  rag.ts         - RAG pipeline orchestration

/prisma
  schema.prisma  - Database schema
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **PostgreSQL**
- **Prisma ORM**
- **OpenAI API** (embeddings + completions)
- **TailwindCSS**
