"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import type { Article } from "@/types";
import { formatDate } from "@/lib/utils";
import { getCategoryColor } from "@/lib/category-colors";

interface SpotlightSectionProps {
  article: Article;
}

export default function SpotlightSection({ article }: SpotlightSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const catColor = getCategoryColor(article.category);

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] flex items-center overflow-hidden bg-surface"
    >
      {/* Background blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-surface/60 z-10" />

      {/* Parallax image — tinted with category colour */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 z-0"
      >
        <div
          className="w-full h-[120%]"
          style={{
            background: `linear-gradient(135deg, ${catColor.hex}0d 0%, transparent 50%, ${catColor.hex}08 100%)`,
          }}
        />
      </motion.div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text content — border uses category colour */}
        <div
          className="border-l-2 pl-6 sm:pl-8"
          style={{ borderColor: catColor.hex }}
        >
          <span
            className="font-mono text-xs tracking-widest mb-4 block"
            style={{ color: catColor.hex }}
          >
            // {article.category.toUpperCase()} &middot;{" "}
            {article.is_featured ? "FEATURED" : "SPOTLIGHT"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h2>
          <p className="text-muted text-base sm:text-lg mb-6 leading-relaxed max-w-lg">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 mb-6 font-mono text-xs text-muted">
            <span>{article.contributor_name || article.author?.full_name}</span>
            <span className="text-border-subtle">/</span>
            <span>{article.published_at ? formatDate(article.published_at) : ""}</span>
            <span className="text-border-subtle">/</span>
            <span>{article.read_time_minutes} min read</span>
          </div>
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center gap-2 font-mono text-sm transition-colors group"
            style={{ color: catColor.hex }}
          >
            READ FULL STORY
            <span className="group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </Link>
        </div>

        {/* Article cover — shows actual image or category-tinted placeholder */}
        <div className="hidden lg:block">
          <div className="aspect-[4/3] rounded-lg bg-surface-light border border-border-subtle overflow-hidden relative">
            {article.cover_image_url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${catColor.hex}1a 0%, transparent 70%)`,
                }}
              />
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="font-mono text-[10px] text-muted bg-background/80 backdrop-blur px-3 py-2 rounded">
                // COVER STORY &middot; VOL. XII
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
