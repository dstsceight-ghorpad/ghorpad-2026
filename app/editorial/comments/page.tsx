"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Check, X, Trash2, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatDateShort } from "@/lib/utils";

interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  article_title?: string;
}

type FilterTab = "all" | "pending" | "approved";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadComments() {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    // Fetch all comments with article title
    const { data } = await supabase
      .from("comments")
      .select("id, article_id, author_name, content, is_approved, created_at")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch article titles for each unique article_id
      const articleIds = [...new Set(data.map((c) => c.article_id))];
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title")
        .in("id", articleIds);

      const titleMap = new Map(articles?.map((a) => [a.id, a.title]) || []);

      setComments(
        data.map((c) => ({
          ...c,
          article_title: titleMap.get(c.article_id) || "Unknown Article",
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function handleApprove(id: string) {
    setActionLoading(id);
    await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_approved: true }),
    });
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_approved: true } : c))
    );
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_approved: false }),
    });
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_approved: false } : c))
    );
    setActionLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this comment permanently?")) return;
    setActionLoading(id);
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setComments((prev) => prev.filter((c) => c.id !== id));
    setActionLoading(null);
  }

  const filtered = comments.filter((c) => {
    if (activeTab === "pending") return !c.is_approved;
    if (activeTab === "approved") return c.is_approved;
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "ALL", count: comments.length },
    { key: "pending", label: "PENDING", count: comments.filter((c) => !c.is_approved).length },
    { key: "approved", label: "APPROVED", count: comments.filter((c) => c.is_approved).length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
            <MessageCircle size={28} /> Comments
          </h1>
          <p className="font-mono text-xs text-muted mt-1">
            // COMMENT MODERATION · {comments.length} total
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`font-mono text-[10px] tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-gold text-background"
                : "text-muted border border-border-subtle hover:border-gold/30"
            }`}
          >
            {tab.label}
            <span className="bg-background/20 px-1.5 py-0.5 rounded text-[9px]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle size={32} className="mx-auto text-muted/20 mb-3" />
          <p className="font-mono text-xs text-muted">No comments in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <div
              key={comment.id}
              className="bg-surface border border-border-subtle rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.author_name}</span>
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                        comment.is_approved
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {comment.is_approved ? "APPROVED" : "PENDING"}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">{comment.content}</p>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-muted/60">
                    <span>On: {comment.article_title}</span>
                    <span>·</span>
                    <span>{formatDateShort(comment.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {actionLoading === comment.id ? (
                    <Loader2 size={14} className="animate-spin text-muted" />
                  ) : (
                    <>
                      {!comment.is_approved && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="p-1.5 rounded text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {comment.is_approved && (
                        <button
                          onClick={() => handleReject(comment.id)}
                          className="p-1.5 rounded text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                          title="Unapprove"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
