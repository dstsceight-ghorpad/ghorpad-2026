"use client";

import { useState } from "react";
import { X, FileText, Newspaper, MessageSquare, Mic, Calendar, BookOpen, UserCircle } from "lucide-react";
import { articleTemplates, type ArticleTemplate } from "@/lib/article-templates";

const templateIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  blank: FileText,
  news: Newspaper,
  opinion: MessageSquare,
  interview: Mic,
  event: Calendar,
  review: BookOpen,
  profile: UserCircle,
};

interface TemplatePickerProps {
  onSelect: (template: ArticleTemplate) => void;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-subtle rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div>
            <h3 className="font-serif text-lg font-bold">Choose a Template</h3>
            <p className="font-mono text-[10px] text-muted mt-0.5">
              // START WITH A STRUCTURE OR BEGIN FROM SCRATCH
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template Grid */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articleTemplates.map((template) => {
            const Icon = templateIcons[template.id] || FileText;
            const isHovered = hoveredId === template.id;

            return (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  isHovered
                    ? "border-gold bg-gold/5"
                    : "border-border-subtle hover:border-gold/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isHovered ? "bg-gold/20 text-gold" : "bg-surface-light text-muted"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif text-sm font-semibold mb-1">
                      {template.name}
                    </h4>
                    <p className="font-mono text-[10px] text-muted leading-relaxed">
                      {template.description}
                    </p>
                    <span className="inline-block font-mono text-[9px] text-gold/60 bg-gold/5 px-1.5 py-0.5 rounded mt-2">
                      {template.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
