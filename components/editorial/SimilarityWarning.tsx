"use client";

import { AlertTriangle, X, ExternalLink } from "lucide-react";
import type { SimilarityMatch } from "@/lib/similarity";

interface SimilarityWarningProps {
  matches: SimilarityMatch[];
  onProceed: () => void;
  onGoBack: () => void;
}

export default function SimilarityWarning({
  matches,
  onProceed,
  onGoBack,
}: SimilarityWarningProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onGoBack}
    >
      <div
        className="bg-surface border border-border-subtle rounded-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <AlertTriangle size={18} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Similar Content Detected</h3>
              <p className="font-mono text-[10px] text-muted mt-0.5">
                PLAGIARISM CHECK WARNING
              </p>
            </div>
          </div>
          <button
            onClick={onGoBack}
            className="p-2 text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Matches */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted">
            Your article appears to share significant content with the following
            existing articles:
          </p>

          {matches.map((match) => (
            <div
              key={match.articleId}
              className="border border-border-subtle rounded-lg p-4 bg-surface-light"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-serif text-sm font-semibold">
                  {match.articleTitle}
                </h4>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded shrink-0 ${
                    match.similarity > 0.6
                      ? "bg-red-400/10 text-red-400"
                      : match.similarity > 0.4
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "bg-blue-400/10 text-blue-400"
                  }`}
                >
                  {Math.round(match.similarity * 100)}% match
                </span>
              </div>

              {match.matchingSnippets.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  <span className="font-mono text-[9px] text-muted">
                    MATCHING PHRASES:
                  </span>
                  {match.matchingSnippets.map((snippet, i) => (
                    <p
                      key={i}
                      className="font-mono text-[11px] text-muted bg-background/50 px-2 py-1 rounded"
                    >
                      &ldquo;...{snippet}...&rdquo;
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-subtle">
          <button
            onClick={onGoBack}
            className="font-mono text-xs px-4 py-2 bg-surface border border-border-subtle rounded hover:border-gold/50 transition-all"
          >
            GO BACK & EDIT
          </button>
          <button
            onClick={onProceed}
            className="font-mono text-xs px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded hover:bg-yellow-400/30 transition-colors"
          >
            PUBLISH ANYWAY
          </button>
        </div>
      </div>
    </div>
  );
}
