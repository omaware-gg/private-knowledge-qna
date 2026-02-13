import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chunkText } from '@/lib/chunking';
import { generateEmbedding } from '@/lib/embeddings';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

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

    const chunks = chunkText(text);

    const document = await prisma.document.create({
      data: {
        name: file.name,
        chunks: {
          create: await Promise.all(
            chunks.map(async (chunkContent) => {
              const embedding = await generateEmbedding(chunkContent);
              return {
                content: chunkContent,
                embedding,
              };
            })
          ),
        },
      },
      include: {
        chunks: true,
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        chunkCount: document.chunks.length,
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
