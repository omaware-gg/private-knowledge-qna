import { prisma } from './prisma';
import { generateEmbedding } from './embeddings';
import OpenAI from 'openai';
import pgvector from 'pgvector';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOP_K = 3;
const MAX_COSINE_DISTANCE = 0.5; // similarity > 0.5 => distance < 0.5
const MAX_DISTANCE_FOR_BEST = 0.9; // if best chunk has distance > 0.9 (similarity < 0.1), say no relevant

export interface RAGResult {
  answer: string;
  sources: Array<{
    documentName: string;
    chunkContent: string;
  }>;
}

export async function queryRAG(question: string): Promise<RAGResult> {
  const questionEmbedding = await generateEmbedding(question);
  const embeddingSql = pgvector.toSql(questionEmbedding);

  // pgvector cosine distance operator <=>; database returns only top matches
  const rows = await prisma.$queryRaw<
    Array<{ content: string; documentName: string; distance: number }>
  >`
    SELECT c.content, d.name as "documentName", (c.embedding <=> ${embeddingSql}::vector) as distance
    FROM "Chunk" c
    JOIN "Document" d ON c."documentId" = d.id
    ORDER BY c.embedding <=> ${embeddingSql}::vector
    LIMIT ${TOP_K}
  `;

  if (rows.length === 0) {
    return {
      answer: 'No documents have been uploaded yet.',
      sources: [],
    };
  }

  const relevantRows = rows.filter((r) => r.distance <= MAX_COSINE_DISTANCE);
  if (relevantRows.length === 0 || rows[0].distance > MAX_DISTANCE_FOR_BEST) {
    return {
      answer: 'No relevant information found in uploaded documents.',
      sources: [],
    };
  }

  const contextChunks = relevantRows.map((r) => r.content).join('\n\n---\n\n');

  const prompt = `You are a precise assistant. Answer strictly using the provided context.
  If the answer is not contained in the context, respond with:
  "I don't know based on the provided documents."

Context:
${contextChunks}

Question: ${question}

Answer:`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
    });

    const answer = completion.choices[0]?.message?.content || 'I could not generate an answer.';

    const sources = relevantRows.map((r) => ({
      documentName: r.documentName,
      chunkContent: r.content,
    }));

    return {
      answer,
      sources,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
    throw new Error('Failed to generate answer: Unknown error');
  }
}
