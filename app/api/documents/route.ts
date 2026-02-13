import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Prevent caching so the documents list is always fresh (e.g. after upload on Vercel)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const body = {
      documents: documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        chunkCount: doc._count.chunks,
        createdAt: doc.createdAt,
      })),
    };

    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Documents fetch error:', error);
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
