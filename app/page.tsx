import Link from "next/link";

const features = [
  {
    step: "01",
    title: "Upload Documents",
    description:
      "Drop your .txt files and they are automatically chunked, embedded, and stored with vector search.",
    href: "/upload",
    cta: "Upload",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    step: "02",
    title: "Browse Library",
    description:
      "View all uploaded documents with chunk counts, timestamps, and manage your knowledge base.",
    href: "/documents",
    cta: "Browse",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    step: "03",
    title: "Ask Questions",
    description:
      "Ask anything about your documents. Get precise answers grounded in your content with source attribution.",
    href: "/ask",
    cta: "Ask now",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    step: "04",
    title: "System Health",
    description:
      "Monitor database, embedding API, and completion API health in real-time.",
    href: "/status",
    cta: "Check status",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="text-center pt-12 pb-16 animate-fade-in-up">
        <div className="inline-block mb-6">
          <span className="badge-success text-xs tracking-wide uppercase">
            RAG-powered
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white via-white/90 to-accent-light bg-clip-text text-transparent">
          Private Knowledge
          <br />
          Q&A Workspace
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your documents, ask questions, and get answers grounded in your
          content. Powered by OpenAI embeddings and PostgreSQL vector search.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/upload" className="btn-primary">
            Get Started
          </Link>
          <Link
            href="/ask"
            className="px-6 py-3 rounded-xl font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-300"
          >
            Ask a Question
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-2 gap-6 mb-16">
        {features.map((feature, i) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="glass group p-6 hover:bg-white/[0.16] transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} text-white text-sm font-bold shadow-lg`}
              >
                {feature.step}
              </span>
              <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
            </div>
            <p className="text-sm text-white/45 leading-relaxed mb-5">
              {feature.description}
            </p>
            <span className="text-sm font-medium text-accent-light group-hover:text-white transition-colors">
              {feature.cta} &rarr;
            </span>
          </Link>
        ))}
      </section>

      {/* How it works */}
      <section className="glass-subtle p-8 mb-10 animate-fade-in-up">
        <h2 className="text-xl font-semibold text-white/80 mb-3">
          How It Works
        </h2>
        <p className="text-sm text-white/45 leading-relaxed">
          This application uses a{" "}
          <span className="text-accent-light font-medium">
            RAG (Retrieval-Augmented Generation)
          </span>{" "}
          pipeline. When you upload a document, it&apos;s recursively split into
          semantically meaningful chunks, each chunk is embedded using
          OpenAI&apos;s embedding model, and stored in PostgreSQL with pgvector.
          When you ask a question, your question is embedded, matched against
          document chunks using cosine similarity in the database, and the most
          relevant chunks are sent to an LLM to generate an answer grounded in
          your documents.
        </p>
      </section>
    </div>
  );
}
