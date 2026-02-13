'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  chunkCount: number;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to fetch documents');
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white/90 mb-2">Documents</h1>
          <p className="text-white/40 text-sm">
            {documents.length} document{documents.length !== 1 ? 's' : ''} in
            your knowledge base
          </p>
        </div>
        <Link href="/upload" className="btn-primary text-sm">
          Upload New
        </Link>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}

      {loading ? (
        <div className="glass p-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl loading-shimmer"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-white/25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <p className="text-white/50 mb-4">No documents uploaded yet.</p>
          <Link
            href="/upload"
            className="text-sm font-medium text-accent-light hover:text-white transition-colors"
          >
            Upload your first document &rarr;
          </Link>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_180px] gap-4 px-6 py-3 border-b border-white/[0.06] text-xs font-medium text-white/35 uppercase tracking-wider">
            <span>Document</span>
            <span className="text-center">Chunks</span>
            <span className="text-right">Uploaded</span>
          </div>
          {/* Rows */}
          {documents.map((doc, i) => (
            <div
              key={doc.id}
              className={`grid grid-cols-[1fr_100px_180px] gap-4 px-6 py-4 items-center transition-colors hover:bg-white/[0.04] ${
                i !== documents.length - 1 ? 'border-b border-white/[0.04]' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-accent-light"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/80 truncate">
                  {doc.name}
                </span>
              </div>
              <span className="text-sm text-white/45 text-center tabular-nums">
                {doc.chunkCount}
              </span>
              <span className="text-sm text-white/35 text-right tabular-nums">
                {new Date(doc.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
