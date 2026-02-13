-- Add contentHash column for duplicate detection.
-- Existing documents get a hash derived from their id (placeholder).
ALTER TABLE "Document"
  ADD COLUMN "contentHash" TEXT;

-- Back-fill existing rows so the column can be made NOT NULL.
UPDATE "Document"
  SET "contentHash" = encode(sha256(("id")::bytea), 'hex')
  WHERE "contentHash" IS NULL;

-- Now enforce NOT NULL and unique.
ALTER TABLE "Document"
  ALTER COLUMN "contentHash" SET NOT NULL;

CREATE UNIQUE INDEX "Document_contentHash_key" ON "Document"("contentHash");
