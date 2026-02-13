import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chunkText } from '@/lib/chunking';
import { generateEmbedding } from '@/lib/embeddings';
import pgvector from 'pgvector';
import crypto from 'crypto';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

/** Compute SHA-256 hex digest of a string. */
function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Only .txt files are supported' },
        { status: 400 }
      );
    }

    const text = await file.text();

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'File contains no text content' },
        { status: 400 }
      );
    }

    // ── Duplicate detection via SHA-256 content hash ──
    const contentHash = sha256(text);

    const existing = await prisma.document.findUnique({
      where: { contentHash },
      select: { id: true, name: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `Duplicate content detected. A document with identical content already exists: "${existing.name}".`,
          duplicate: true,
          existingDocument: { id: existing.id, name: existing.name },
        },
        { status: 409 } // 409 Conflict
      );
    }

    // ── Chunking & embedding ──
    const chunks = chunkText(text);

    const document = await prisma.document.create({
      data: { name: file.name, contentHash },
    });

    let chunkCount = 0;
    for (const content of chunks) {
      const embedding = await generateEmbedding(content);
      const embeddingSql = pgvector.toSql(embedding);
      await prisma.$executeRaw`
        INSERT INTO "Chunk" (id, "documentId", content, embedding, "createdAt")
        VALUES (gen_random_uuid(), ${document.id}, ${content}, (${embeddingSql})::vector, now())
      `;
      chunkCount++;
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        chunkCount,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
