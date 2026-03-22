"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  Pencil,
  Loader2,
  Trash2,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatDateShort } from "@/lib/utils";
import type { Article, ArticleStatus } from "@/types";

type FilterTab = "all" | "draft" | "review" | "published";

const statusColors: Record<ArticleStatus, string> = {
  draft: "bg-blue-500/10 text-blue-400",
  review: "bg-yellow-500/10 text-yellow-400",
  published: "bg-green-500/10 text-green-400",
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    async function fetchArticles() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("articles")
        .select("*, author:profiles!articles_author_id_fkey(*)")
        .order("updated_at", { ascending: false });

      setArticles((data as Article[]) || []);
      setLoading(false);
    }

    fetchArticles();
  }, []);

  const filtered = articles.filter((a) => {
    if (activeTab === "all") return true;
    return a.status === activeTab;
  });

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "ALL", count: articles.length },
    {
      key: "draft",
      label: "DRAFTS",
      count: articles.filter((a) => a.status === "draft").length,
    },
    {
      key: "review",
      label: "IN REVIEW",
      count: articles.filter((a) => a.status === "review").length,
    },
    {
      key: "published",
      label: "PUBLISHED",
      count: articles.filter((a) => a.status === "published").length,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-gold" />
            <h1 className="font-serif text-2xl font-bold">Articles</h1>
          </div>
          <p className="font-mono text-xs text-muted">
            // ALL ARTICLES &middot; {articles.length} total
          </p>
        </div>
        <Link
          href="/editorial/articles/new"
          className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
        >
          <Plus size={14} />
          NEW ARTICLE
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`font-mono text-[10px] px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-gold text-background"
                : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
            }`}
          >
            {tab.label}
            <span
              className={`text-[9px] px-1 rounded ${
                activeTab === tab.key
                  ? "bg-background/20"
                  : "bg-surface-light"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <Loader2 size={32} className="mx-auto text-gold animate-spin mb-3" />
          <p className="font-mono text-xs text-muted">Loading articles...</p>
        </div>
      )}

      {/* Articles table */}
      {!loading && (
        <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    TITLE
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    CATEGORY
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    AUTHOR
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    UPDATED
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    STATUS
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-surface-light/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium truncate block max-w-[280px]">
                        {article.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-muted">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">
                        {article.contributor_name || article.author?.full_name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-muted">
                        {formatDateShort(article.updated_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded ${statusColors[article.status]}`}
                      >
                        {article.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/editorial/articles/${article.id}/edit`}
                          className="font-mono text-[10px] text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
                        >
                          <Pencil size={12} />
                          EDIT
                        </Link>
                        {article.status === "published" && (
                          <Link
                            href={`/articles/${article.slug}`}
                            className="font-mono text-[10px] text-green-400 hover:text-green-400/80 transition-colors flex items-center gap-1"
                          >
                            <Eye size={12} />
                            VIEW
                          </Link>
                        )}
                        <button
                            onClick={async () => {
                              if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
                              const supabase = createBrowserSupabaseClient();
                              const { error } = await supabase
                                .from("articles")
                                .delete()
                                .eq("id", article.id);
                              if (!error) {
                                setArticles((prev) => prev.filter((a) => a.id !== article.id));
                              }
                            }}
                            className="font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            DELETE
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <FileText size={32} className="mx-auto text-muted/20 mb-3" />
              <p className="font-mono text-xs text-muted">
                No articles in this category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
