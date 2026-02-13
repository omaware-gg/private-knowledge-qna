import { NextRequest, NextResponse } from 'next/server';
import { queryRAG } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const result = await queryRAG(question.trim());

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Ask error:', error);
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
