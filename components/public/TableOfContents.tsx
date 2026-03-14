"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { TocEntry } from "@/types";
import { SectionHeading, RevealOnScroll } from "@/components/ui/RevealText";

interface TableOfContentsProps {
  entries: TocEntry[];
}

export default function TableOfContents({ entries }: TableOfContentsProps) {
  // Group entries by category
  const grouped = useMemo(() => {
    const groups: Record<string, TocEntry[]> = {};
    for (const entry of entries) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category].push(entry);
    }
    return Object.entries(groups);
  }, [entries]);

  return (
    <section id="index" className="bg-background py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header — scroll-triggered reveal */}
        <SectionHeading
          label="// INDEX"
          title="Table of Contents"
          className="mb-12"
        />

        {/* Two-column grid on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
          {grouped.map(([category, items], catIndex) => (
            <RevealOnScroll
              key={category}
              delay={catIndex * 0.1}
            >
              {/* Category heading */}
              <h3 className="font-serif text-lg font-semibold text-gold mb-4 border-b border-gold/20 pb-2">
                {category}
              </h3>

              {/* Entry list */}
              <div className="space-y-3">
                {items.map((entry) => {
                  const inner = (
                    <div className="flex items-baseline gap-2 group cursor-pointer">
                      {/* Page number */}
                      <span className="font-mono text-xs text-gold shrink-0 w-6">
                        {entry.page_label}
                      </span>
                      {/* Title */}
                      <span className="font-serif text-sm sm:text-base text-foreground group-hover:text-gold transition-colors truncate">
                        {entry.title}
                      </span>
                      {/* Dot leader */}
                      <span className="flex-1 border-b border-dotted border-border-subtle min-w-[20px]" />
                      {/* Type badge */}
                      <span className="font-mono text-[10px] text-muted shrink-0 uppercase">
                        {entry.type}
                      </span>
                    </div>
                  );

                  return entry.slug ? (
                    <Link key={entry.id} href={`/articles/${entry.slug}`}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={entry.id}>{inner}</div>
                  );
                })}
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
