"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { getArticlesInReview, loadReviewComments, loadReviewDecision } from "@/lib/review";
import { formatDateShort } from "@/lib/utils";
import type { Article } from "@/types";

type FilterTab = "all" | "pending" | "approved" | "rejected";

export default function ReviewQueuePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    setArticles(getArticlesInReview());
  }, []);

  const getDecisionStatus = (articleId: string) => {
    const decision = loadReviewDecision(articleId);
    return decision?.action || "pending";
  };

  const getCommentCount = (articleId: string) => {
    return loadReviewComments(articleId).length;
  };

  const filteredArticles = articles.filter((article) => {
    if (activeTab === "all") return true;
    const status = getDecisionStatus(article.id);
    if (activeTab === "pending") return status === "pending" || status === "request_changes";
    if (activeTab === "approved") return status === "approve";
    if (activeTab === "rejected") return status === "reject";
    return true;
  });

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "ALL", count: articles.length },
    {
      key: "pending",
      label: "PENDING",
      count: articles.filter((a) => {
        const s = getDecisionStatus(a.id);
        return s === "pending" || s === "request_changes";
      }).length,
    },
    {
      key: "approved",
      label: "APPROVED",
      count: articles.filter((a) => getDecisionStatus(a.id) === "approve").length,
    },
    {
      key: "rejected",
      label: "REJECTED",
      count: articles.filter((a) => getDecisionStatus(a.id) === "reject").length,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck size={20} className="text-gold" />
          <h1 className="font-serif text-2xl font-bold">Review Queue</h1>
        </div>
        <p className="font-mono text-xs text-muted">
          // ARTICLES AWAITING EDITORIAL REVIEW &middot; {articles.length} in queue
        </p>
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

      {/* Articles */}
      <div className="space-y-3">
        {filteredArticles.map((article) => {
          const status = getDecisionStatus(article.id);
          const commentCount = getCommentCount(article.id);

          return (
            <div
              key={article.id}
              className="bg-surface border border-border-subtle rounded-lg p-4 hover:border-gold/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-serif text-sm font-semibold mb-1 truncate">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[10px] text-muted">
                      by {article.contributor_name || article.author?.full_name || "Unknown"}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {formatDateShort(article.created_at)}
                    </span>
                    {commentCount > 0 && (
                      <span className="font-mono text-[10px] text-blue-400 flex items-center gap-1">
                        <MessageSquare size={10} />
                        {commentCount}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-gold/60 bg-gold/5 px-1.5 py-0.5 rounded">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Status badge */}
                  <span
                    className={`font-mono text-[10px] px-2 py-1 rounded flex items-center gap-1 ${
                      status === "approve"
                        ? "bg-green-500/10 text-green-400"
                        : status === "reject"
                          ? "bg-red-500/10 text-red-400"
                          : status === "request_changes"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-surface-light text-muted"
                    }`}
                  >
                    {status === "approve" ? (
                      <CheckCircle2 size={10} />
                    ) : status === "reject" ? (
                      <XCircle size={10} />
                    ) : (
                      <Clock size={10} />
                    )}
                    {status === "approve"
                      ? "APPROVED"
                      : status === "reject"
                        ? "REJECTED"
                        : status === "request_changes"
                          ? "CHANGES REQ"
                          : "PENDING"}
                  </span>

                  {/* Review button */}
                  <Link
                    href={`/editorial/articles/${article.id}/edit`}
                    className="font-mono text-[10px] px-3 py-1.5 border border-gold/50 text-gold rounded hover:bg-gold hover:text-background transition-all"
                  >
                    REVIEW
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <ClipboardCheck size={32} className="mx-auto text-muted/20 mb-3" />
          <p className="font-mono text-xs text-muted">
            No articles in this category.
          </p>
        </div>
      )}
    </div>
  );
}
