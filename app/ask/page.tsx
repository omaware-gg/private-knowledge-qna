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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get answer');

      setResult({ answer: data.answer, sources: data.sources || [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/90 mb-2">
          Ask a Question
        </h1>
        <p className="text-white/40 text-sm">
          Ask anything about your uploaded documents. Answers are grounded in
          your content.
        </p>
      </div>

      {/* Question form */}
      <form onSubmit={handleSubmit} className="glass p-6 mb-8">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          rows={4}
          className="input-glass mb-4 resize-none"
          placeholder="What would you like to know about your documents?"
        />

        {error && <div className="alert-error mb-4">{error}</div>}

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="btn-primary w-full text-center"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Thinking...
            </span>
          ) : (
            'Ask'
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Answer card */}
          <div className="glass-strong p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white/85">Answer</h2>
            </div>
            <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">
              {result.answer}
            </p>
          </div>

          {/* Sources */}
          {result.sources.length > 0 && (
            <div className="glass p-6">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                Sources
              </h2>
              <div className="space-y-4">
                {result.sources.map((source, index) => (
                  <div
                    key={index}
                    className="glass-subtle p-4 border-l-2 border-accent/40"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-3.5 h-3.5 text-accent-light"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-accent-light">
                        {source.documentName}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {source.chunkContent}
                    </p>
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
