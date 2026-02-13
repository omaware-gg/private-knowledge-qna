'use client';

import { useState } from 'react';

interface Source {
  documentName: string;
  chunkContent: string;
}

interface RAGResponse {
  answer: string;
  sources: Source[];
}

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RAGResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setResult({
        answer: data.answer,
        sources: data.sources || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Ask a Question</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Your Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ask a question about your uploaded documents..."
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Answer</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{result.answer}</p>
          </div>

          {result.sources.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Sources</h2>
              <div className="space-y-4">
                {result.sources.map((source, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="font-medium text-gray-900 mb-2">
                      Document: {source.documentName}
                    </div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                      {source.chunkContent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
