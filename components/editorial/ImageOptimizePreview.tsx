"use client";

import { Check, X, TrendingDown } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import type { ImageOptimizeResult } from "@/types";

interface ImageOptimizePreviewProps {
  result: ImageOptimizeResult;
  onAccept: (dataUrl: string) => void;
  onReject: () => void;
}

export default function ImageOptimizePreview({
  result,
  onAccept,
  onReject,
}: ImageOptimizePreviewProps) {
  const reduction = Math.round(
    ((result.originalSize - result.optimizedSize) / result.originalSize) * 100
  );

  return (
    <div className="border border-border-subtle rounded-lg p-3 bg-surface">
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded overflow-hidden bg-surface-light shrink-0">
          <img
            src={result.dataUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Size comparison */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-muted">
              {formatFileSize(result.originalSize)}
            </span>
            <TrendingDown size={12} className="text-green-400" />
            <span className="font-mono text-[10px] text-green-400">
              {formatFileSize(result.optimizedSize)}
            </span>
          </div>

          <p className="font-mono text-[10px] text-muted">
            {result.width}x{result.height}px &middot;{" "}
            <span className="text-green-400">{reduction}% smaller</span>
          </p>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onAccept(result.dataUrl)}
              className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
            >
              <Check size={10} />
              USE OPTIMIZED
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded text-muted hover:text-foreground transition-colors"
            >
              <X size={10} />
              ORIGINAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
