"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import { ArrowLeft, Twitter, Link as LinkIcon, MessageCircle } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import TipTapRenderer from "@/components/public/TipTapRenderer";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { getCategoryColor, getCategoryBadgeClasses } from "@/lib/category-colors";
import type { Article } from "@/types";

/* Stagger animation variants for shared-layout morphing feel */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { scrollYProgress } = useScroll();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      const supabase = createBrowserSupabaseClient();

      // Fetch the article by slug
      const { data } = await supabase
        .from("articles")
        .select("*, author:profiles!articles_author_id_fkey(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (data) {
        setArticle(data as Article);

        // Fetch related articles (same category, different slug)
        const { data: related } = await supabase
          .from("articles")
          .select("*, author:profiles!articles_author_id_fkey(*)")
          .eq("status", "published")
          .neq("slug", slug)
          .limit(3);

        setRelatedArticles((related as Article[]) || []);
      }

      setLoading(false);
    }

    fetchArticle();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="font-mono text-xs text-muted animate-pulse">Loading...</div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="font-serif text-3xl mb-4">Article Not Found</h1>
            <Link href="/" className="text-gold font-mono text-sm hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const authorName = article.contributor_name || article.author?.full_name;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Reading progress bar — category coloured */}
      <motion.div
        style={{
          scaleX: scrollYProgress,
          backgroundColor: getCategoryColor(article.category).hex,
        }}
        className="fixed top-0 left-0 right-0 h-0.5 origin-left z-[60]"
      />

      {/* Hero — staggered reveal creates shared-layout morphing feel */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-surface to-background" />
        {/* Category-tinted gradient overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `linear-gradient(135deg, ${getCategoryColor(article.category).hex} 0%, transparent 50%)`,
          }}
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative max-w-4xl mx-auto pt-12"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-gold mb-8 transition-colors"
            >
              <ArrowLeft size={14} />
              BACK TO HOME
            </Link>
          </motion.div>

          <motion.span
            variants={fadeUp}
            className="font-mono text-xs tracking-widest block mb-4"
            style={{ color: getCategoryColor(article.category).hex }}
          >
            // {article.category.toUpperCase()}
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight"
          >
            {article.title}
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  backgroundColor: `${getCategoryColor(article.category).hex}33`,
                  color: getCategoryColor(article.category).hex,
                }}
              >
                {authorName?.charAt(0) || "?"}
              </div>
              <span>{authorName}</span>
            </div>
            <span className="text-border-subtle">|</span>
            <span>
              {article.published_at ? formatDate(article.published_at) : ""}
            </span>
            <span className="text-border-subtle">|</span>
            <span>{article.read_time_minutes} min read</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-light px-2 py-0.5 rounded text-[10px]"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Cover image */}
      {article.cover_image_url && (
        <section className="px-4 sm:px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full rounded-lg object-cover max-h-[500px]"
            />
          </div>
        </section>
      )}

      {/* Article body */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-4xl mx-auto relative">
          {/* Share sidebar (desktop) */}
          <div className="hidden lg:flex fixed left-[max(1rem,calc(50%-36rem))] top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`,
                  "_blank"
                )
              }
              className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-muted hover:text-gold hover:border-gold/50 transition-all"
              title="Share on X"
            >
              <Twitter size={16} />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(article.title + " " + window.location.href)}`,
                  "_blank"
                )
              }
              className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-muted hover:text-gold hover:border-gold/50 transition-all"
              title="Share on WhatsApp"
            >
              <MessageCircle size={16} />
            </button>
            <button
              onClick={handleCopyLink}
              className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-muted hover:text-gold hover:border-gold/50 transition-all"
              title="Copy link"
            >
              {copied ? (
                <span className="text-gold text-[10px] font-mono">OK</span>
              ) : (
                <LinkIcon size={16} />
              )}
            </button>
          </div>

          {/* Article content — rendered from TipTap JSON */}
          <TipTapRenderer content={article.content} />

          {/* Mobile share bar */}
          <div className="lg:hidden flex gap-3 mt-8 pt-6 border-t border-border-subtle">
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`,
                  "_blank"
                )
              }
              className="flex items-center gap-2 text-muted text-sm hover:text-gold transition-colors"
            >
              <Twitter size={16} /> Share
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 text-muted text-sm hover:text-gold transition-colors"
            >
              <LinkIcon size={16} /> {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </section>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-8">
              // YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((ra) => (
                <Link
                  key={ra.id}
                  href={`/articles/${ra.slug}`}
                  className="group bg-surface border border-border-subtle rounded-lg overflow-hidden hover:border-gold/30 transition-all"
                >
                  <div className="aspect-video bg-surface-light relative overflow-hidden">
                    {ra.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ra.cover_image_url}
                        alt={ra.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${getCategoryBadgeClasses(ra.category)}`}>
                        {ra.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-base font-semibold group-hover:text-gold transition-colors leading-snug mb-2">
                      {ra.title}
                    </h3>
                    <p className="font-mono text-[10px] text-muted">
                      {ra.contributor_name || ra.author?.full_name} &middot;{" "}
                      {ra.read_time_minutes} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
