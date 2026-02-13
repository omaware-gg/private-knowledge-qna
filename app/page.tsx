import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Private Knowledge Q&A</h1>
      <p className="text-lg text-gray-600 mb-12">
        Upload your documents and ask questions to get answers grounded in your content.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-semibold mb-4">1. Upload Documents</div>
          <p className="text-gray-600 mb-4">
            Upload .txt files containing your knowledge base. Files are automatically chunked and embedded.
          </p>
          <Link href="/upload" className="text-blue-600 hover:text-blue-800 font-medium">
            Go to Upload →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-semibold mb-4">2. View Documents</div>
          <p className="text-gray-600 mb-4">
            See all uploaded documents with chunk counts and upload timestamps.
          </p>
          <Link href="/documents" className="text-blue-600 hover:text-blue-800 font-medium">
            View Documents →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-semibold mb-4">3. Ask Questions</div>
          <p className="text-gray-600 mb-4">
            Ask questions about your uploaded documents and get answers with source attribution.
          </p>
          <Link href="/ask" className="text-blue-600 hover:text-blue-800 font-medium">
            Ask a Question →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-semibold mb-4">4. See Answer & Source</div>
          <p className="text-gray-600 mb-4">
            Get answers grounded in your documents, with exact source chunks and document names.
          </p>
          <Link href="/ask" className="text-blue-600 hover:text-blue-800 font-medium">
            Try It →
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">How It Works</h2>
        <p className="text-gray-700">
          This application uses a RAG (Retrieval-Augmented Generation) pipeline. When you upload a document,
          it&apos;s split into chunks, each chunk is embedded using OpenAI&apos;s embedding model, and stored in PostgreSQL.
          When you ask a question, your question is embedded, matched against document chunks using cosine similarity,
          and the most relevant chunks are sent to an LLM to generate an answer grounded in your documents.
        </p>
      </div>
    </div>
  );
}
