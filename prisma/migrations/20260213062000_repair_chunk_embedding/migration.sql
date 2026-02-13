-- Repair: re-add embedding column after failed migration 20260213051443 (it dropped the column).
-- Existing rows get a zero vector so NOT NULL is satisfied; re-upload documents to get real embeddings.
ALTER TABLE "Chunk"
  ADD COLUMN IF NOT EXISTS "embedding" vector(1536) NOT NULL
  DEFAULT ('[' || repeat('0,', 1535) || '0' || ']')::vector(1536);
