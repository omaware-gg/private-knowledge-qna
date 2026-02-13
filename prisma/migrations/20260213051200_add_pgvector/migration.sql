-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Convert Chunk.embedding from double precision[] to vector(1536)
-- Existing data: array_to_string gives 'a,b,c', wrap in brackets for vector format
ALTER TABLE "Chunk"
  ALTER COLUMN "embedding" TYPE vector(1536)
  USING ('[' || array_to_string(embedding, ',') || ']')::vector(1536);
