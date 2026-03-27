"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
          Something went wrong
        </h1>
        <p className="text-muted text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="font-mono text-xs tracking-widest px-6 py-3 bg-gold text-background rounded hover:bg-gold/90 transition-colors"
        >
          TRY AGAIN
        </button>
        <div className="mt-8">
          <a
            href="/"
            className="font-mono text-[10px] text-muted hover:text-gold transition-colors"
          >
            &larr; BACK TO HOME
          </a>
        </div>
      </div>
    </div>
  );
}
