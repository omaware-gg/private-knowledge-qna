import { prisma } from './prisma';
import { generateEmbedding } from './embeddings';
import { cosineSimilarity } from './similarity';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RAGResult {
  answer: string;
  sources: Array<{
    documentName: string;
    chunkContent: string;
  }>;
}

export async function queryRAG(question: string): Promise<RAGResult> {
  const questionEmbedding = await generateEmbedding(question);

  const allChunks = await prisma.chunk.findMany({
    include: {
      document: {
        select: {
          name: true,
        },
      },
    },
  });

  if (allChunks.length === 0) {
    return {
      answer: 'No documents have been uploaded yet.',
      sources: [],
    };
  }

  const scoredChunks = allChunks.map((chunk) => ({
    chunk,
    similarity: cosineSimilarity(questionEmbedding, chunk.embedding),
  }));
  
  const similarities = scoredChunks
    .filter((s) => s.similarity > 0.5)   // <-- adjust threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  if (similarities.length === 0 || similarities[0].similarity < 0.1) {
    return {
      answer: 'No relevant information found in uploaded documents.',
      sources: [],
    };
  }

  const contextChunks = similarities
    .map((s) => s.chunk.content)
    .join('\n\n---\n\n');

  const prompt = `You are answering strictly using the provided context. If the answer is not in the context, say you don't know.

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

    const sources = similarities.map((s) => ({
      documentName: s.chunk.document.name,
      chunkContent: s.chunk.content,
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
