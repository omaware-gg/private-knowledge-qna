import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Knowledge Q&A",
  description: "Private Knowledge Q&A Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        {/* Ambient background orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[100px]" />
          <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-violet-600/15 blur-[110px]" />
        </div>

        {/* Navigation */}
        <nav className="glass-nav sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-bold tracking-tight text-white/90 hover:text-white transition-colors"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark text-white text-sm font-bold">
                  K
                </span>
                Knowledge Q&A
              </Link>

              <div className="flex items-center gap-1">
                {[
                  { href: "/upload", label: "Upload" },
                  { href: "/documents", label: "Documents" },
                  { href: "/ask", label: "Ask" },
                  { href: "/status", label: "Status" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
