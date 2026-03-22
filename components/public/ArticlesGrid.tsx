"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Article } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  getCategoryBadgeClasses,
  getCategoryFilterClasses,
  getCategoryColor,
} from "@/lib/category-colors";
import { SectionHeading } from "@/components/ui/RevealText";
import TiltCard from "@/components/ui/TiltCard";

import { CATEGORIES } from "@/types";

const filters = ["ALL", ...CATEGORIES.map((c) => c.toUpperCase())];

interface ArticlesGridProps {
  articles: Article[];
}

export default function ArticlesGrid({ articles }: ArticlesGridProps) {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filtered =
    activeFilter === "ALL"
      ? articles
      : articles.filter(
          (a) => a.category.toUpperCase() === activeFilter
        );

  return (
    <section id="articles" className="bg-background py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section title — scroll-triggered reveal */}
        <SectionHeading label="// LATEST DISPATCHES" className="mb-10" />

        {/* Filter tabs — each category gets its own accent colour */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map((f) => {
            const isActive = activeFilter === f;
            const activeClasses =
              f === "ALL"
                ? "bg-gold text-background"
                : getCategoryFilterClasses(f);

            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`font-mono text-xs px-4 py-1.5 rounded transition-all duration-200 ${
                  isActive
                    ? activeClasses
                    : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((article, i) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted font-mono text-sm py-20">
            No articles in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const catColor = getCategoryColor(article.category);
  const badgeClasses = getCategoryBadgeClasses(article.category);

  return (
    <TiltCard maxTilt={5} hoverScale={1.01} className="h-full">
    <Link href={`/articles/${article.slug}`} className="block h-full cursor-pointer">
      <div
        className="group bg-surface border border-border-subtle rounded-lg overflow-hidden transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:border-gold/30 cursor-pointer"
        style={{
          ["--cat-hex" as string]: catColor.hex,
        }}
      >
        {/* Cover image — uniform aspect-video for all cards */}
        <div className="aspect-video bg-surface-light relative overflow-hidden">
          {article.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover pointer-events-auto"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${catColor.hex}33 0%, transparent 60%)`,
              }}
            />
          )}
          <div className="absolute top-3 left-3">
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded ${badgeClasses}`}
            >
              {article.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3
            className={`font-serif text-lg font-semibold mb-2 transition-colors leading-snug ${catColor.textOnDark} opacity-100 group-hover:opacity-100`}
            style={{ color: undefined }}
          >
            <span className="text-foreground group-hover:text-[var(--cat-hex)] transition-colors duration-300">
              {article.title}
            </span>
          </h3>
          <p className="text-muted text-sm mb-4 line-clamp-2 flex-1">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between font-mono text-[10px] text-muted">
            <span>{article.contributor_name || article.author?.full_name}</span>
            <span className="flex items-center gap-2">
              <span>{article.read_time_minutes} min</span>
              <span className="text-border-subtle">|</span>
              <span>{article.published_at ? formatDate(article.published_at) : ""}</span>
            </span>
          </div>
        </div>

        {/* Bottom accent bar — category coloured */}
        <div
          className="h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out"
          style={{ backgroundColor: catColor.hex }}
        />
      </div>
    </Link>
    </TiltCard>
  );
}
