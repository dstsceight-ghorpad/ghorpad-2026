"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle, Circle, AlertTriangle } from "lucide-react";
import {
  PUBLISH_CHECKLIST,
  runAutoChecks,
  canPublishChecklist,
  type ChecklistResult,
} from "@/lib/publish-checklist";

interface PublishChecklistProps {
  formData: {
    title: string;
    excerpt: string;
    coverImageUrl: string;
    category: string;
    tags: string[];
    content: Record<string, unknown> | null;
  };
  onConfirm: () => void;
  onClose: () => void;
}

export default function PublishChecklist({
  formData,
  onConfirm,
  onClose,
}: PublishChecklistProps) {
  const autoResults = runAutoChecks(formData);

  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

  // Build full results: for auto items use autoResults, for manual items use local state
  const allResults: ChecklistResult[] = PUBLISH_CHECKLIST.map((item) => {
    if (item.check === "auto") {
      return autoResults.find((r) => r.item.id === item.id)!;
    }
    return {
      item,
      passed: !!manualChecks[item.id],
    };
  });

  const canPublish = canPublishChecklist(allResults);

  const toggleManual = (id: string) => {
    setManualChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-subtle rounded-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div>
            <h3 className="font-serif text-lg font-bold">Pre-Publish Checklist</h3>
            <p className="font-mono text-[10px] text-muted mt-0.5">
              // VERIFY BEFORE PUBLISHING
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Checklist */}
        <div className="p-5 space-y-3">
          {allResults.map((result) => {
            const isManual = result.item.check === "manual";

            return (
              <div
                key={result.item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  result.passed
                    ? "border-green-500/20 bg-green-500/5"
                    : result.item.required
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-yellow-500/20 bg-yellow-500/5"
                }`}
              >
                {/* Status icon */}
                {isManual ? (
                  <button
                    onClick={() => toggleManual(result.item.id)}
                    className="shrink-0"
                  >
                    {result.passed ? (
                      <CheckCircle2 size={18} className="text-green-400" />
                    ) : (
                      <Circle size={18} className="text-muted/40" />
                    )}
                  </button>
                ) : result.passed ? (
                  <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                ) : result.item.required ? (
                  <XCircle size={18} className="text-red-400 shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="text-yellow-400 shrink-0" />
                )}

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{result.item.label}</span>
                  {isManual && (
                    <span className="font-mono text-[9px] text-muted ml-2">
                      (MANUAL CHECK)
                    </span>
                  )}
                  {result.message && (
                    <p className="font-mono text-[10px] text-muted mt-0.5">
                      {result.message}
                    </p>
                  )}
                </div>

                {/* Required badge */}
                {result.item.required && !result.passed && (
                  <span className="font-mono text-[9px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded shrink-0">
                    REQUIRED
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border-subtle">
          <div className="font-mono text-[10px] text-muted">
            {allResults.filter((r) => r.passed).length}/{allResults.length} CHECKS
            PASSED
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="font-mono text-xs px-4 py-2 text-muted hover:text-foreground transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              disabled={!canPublish}
              className="font-mono text-xs px-4 py-2 bg-gold text-background rounded hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              CONFIRM PUBLISH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
