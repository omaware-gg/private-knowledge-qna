'use client';

import { useState, useRef, useCallback } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (f) {
      setFile(f);
      setError(null);
      setSuccess(null);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setDuplicate(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.duplicate) {
          setDuplicate(
            `A document with identical content already exists: "${data.existingDocument?.name}".`
          );
          return;
        }
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(
        `Successfully uploaded ${data.document.name} (${data.document.chunkCount} chunks)`
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/90 mb-2">
          Upload Document
        </h1>
        <p className="text-white/40 text-sm">
          Upload a .txt file (max 1 MB). It will be chunked, embedded, and ready
          for questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 space-y-6">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-accent bg-accent/10'
              : file
              ? 'border-emerald-400/40 bg-emerald-400/5'
              : 'border-white/15 hover:border-white/30 hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            disabled={uploading}
            className="hidden"
          />

          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              file
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-white/[0.06] text-white/30'
            }`}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {file ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              )}
            </svg>
          </div>

          {file ? (
            <>
              <p className="text-sm font-medium text-white/80">{file.name}</p>
              <p className="text-xs text-white/40">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-white/60">
                Drop your file here or{' '}
                <span className="text-accent-light">browse</span>
              </p>
              <p className="text-xs text-white/30">.txt files up to 1 MB</p>
            </>
          )}
        </div>

        {/* Alerts */}
        {duplicate && (
          <div className="p-4 rounded-xl text-sm" style={{
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            color: '#fcd34d',
          }}>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="font-semibold">Duplicate detected</span>
            </div>
            {duplicate}
          </div>
        )}
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || uploading}
          className="btn-primary w-full text-center"
        >
          {uploading ? (
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
              Uploading & Embedding...
            </span>
          ) : (
            'Upload Document'
          )}
        </button>
      </form>
    </div>
  );
}
