"use client";

import { useState } from "react";
import {
  SpellCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { checkContent, type ContentIssue } from "@/lib/content-checker";

interface ContentCheckerProps {
  getText: () => string;
}

export default function ContentChecker({ getText }: ContentCheckerProps) {
  const [issues, setIssues] = useState<ContentIssue[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const handleCheck = () => {
    setChecking(true);
    const text = getText();
    // Simulate slight delay for UX
    setTimeout(() => {
      const found = checkContent(text);
      setIssues(found);
      setChecking(false);
    }, 300);
  };

  const grouped = issues
    ? {
        spelling: issues.filter((i) => i.type === "spelling"),
        grammar: issues.filter((i) => i.type === "grammar"),
        style: issues.filter((i) => i.type === "style"),
      }
    : null;

  const typeLabels: Record<string, { label: string; color: string }> = {
    spelling: { label: "SPELLING", color: "text-red-400" },
    grammar: { label: "GRAMMAR", color: "text-yellow-400" },
    style: { label: "STYLE", color: "text-blue-400" },
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <SpellCheck size={14} className="text-gold" />
          <span className="font-mono text-[10px] text-gold tracking-widest">
            CONTENT CHECK
          </span>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="font-mono text-[10px] px-3 py-1 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {checking ? "CHECKING..." : issues ? "RE-CHECK" : "CHECK"}
        </button>
      </div>

      {/* Results */}
      <div className="p-3">
        {issues === null && !checking && (
          <p className="font-mono text-[10px] text-muted text-center py-4">
            Click CHECK to scan your article for issues.
          </p>
        )}

        {checking && (
          <div className="flex items-center justify-center py-4 gap-2">
            <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[10px] text-muted">Scanning...</span>
          </div>
        )}

        {issues !== null && !checking && issues.length === 0 && (
          <div className="flex items-center gap-2 py-4 justify-center">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="font-mono text-xs text-green-400">
              No issues found!
            </span>
          </div>
        )}

        {grouped &&
          !checking &&
          Object.entries(grouped).map(([type, typeIssues]) => {
            if (typeIssues.length === 0) return null;
            const isExpanded = expandedType === type;
            const { label, color } = typeLabels[type];

            return (
              <div key={type} className="mb-2">
                <button
                  onClick={() => setExpandedType(isExpanded ? null : type)}
                  className="flex items-center gap-2 w-full py-2 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown size={12} className="text-muted" />
                  ) : (
                    <ChevronRight size={12} className="text-muted" />
                  )}
                  <span className={`font-mono text-[10px] ${color}`}>
                    {label}
                  </span>
                  <span className="font-mono text-[10px] text-muted ml-auto">
                    {typeIssues.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-5 space-y-2">
                    {typeIssues.map((issue, i) => (
                      <div
                        key={i}
                        className="p-2 bg-surface-light rounded border border-border-subtle"
                      >
                        <div className="flex items-start gap-2">
                          {issue.severity === "error" ? (
                            <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs mb-1">{issue.message}</p>
                            <p className="font-mono text-[10px] text-muted truncate">
                              {issue.context}
                            </p>
                            {issue.suggestion && (
                              <p className="font-mono text-[10px] text-green-400 mt-1">
                                Suggestion: {issue.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
