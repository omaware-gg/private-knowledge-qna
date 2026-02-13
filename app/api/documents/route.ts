import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        chunkCount: doc._count.chunks,
        createdAt: doc.createdAt,
      })),
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
