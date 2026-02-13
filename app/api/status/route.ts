import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'error';
  message?: string;
}

export async function GET() {
  const checks: HealthCheck[] = [];

  checks.push({
    service: 'Backend Server',
    status: 'healthy',
  });

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      service: 'PostgreSQL',
      status: 'healthy',
    });
  } catch (error) {
    checks.push({
      service: 'PostgreSQL',
      status: 'error',
      message: error instanceof Error ? error.message : 'Connection failed',
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    checks.push({
      service: 'OpenAI Embedding API',
      status: 'error',
      message: 'OPENAI_API_KEY not set',
    });
    checks.push({
      service: 'OpenAI Completion API',
      status: 'error',
      message: 'OPENAI_API_KEY not set',
    });
  } else {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'test',
      });
      checks.push({
        service: 'OpenAI Embedding API',
        status: 'healthy',
      });
    } catch (error) {
      checks.push({
        service: 'OpenAI Embedding API',
        status: 'error',
        message: error instanceof Error ? error.message : 'API call failed',
      });
    }

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      checks.push({
        service: 'OpenAI Completion API',
        status: 'healthy',
      });
    } catch (error) {
      checks.push({
        service: 'OpenAI Completion API',
        status: 'error',
        message: error instanceof Error ? error.message : 'API call failed',
      });
    }
  }

  const allHealthy = checks.every((check) => check.status === 'healthy');
  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
    },
    { status: statusCode }
  );
}
