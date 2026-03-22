"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Loader2, User } from "lucide-react";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface ArticleCommentsProps {
  articleId: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ArticleComments({ articleId }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments?article_id=${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_id: articleId,
          author_name: name.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
        return;
      }

      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setContent("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-border-subtle">
      <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle size={20} className="text-gold" />
        Comments
        {comments.length > 0 && (
          <span className="font-mono text-xs text-muted font-normal">
            ({comments.length})
          </span>
        )}
      </h3>

      {/* Comment list */}
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-muted">
          <Loader2 size={16} className="animate-spin" />
          <span className="font-mono text-xs">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <p className="font-mono text-xs text-muted py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-surface rounded-lg border border-border-subtle p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center">
                  <User size={14} className="text-gold" />
                </div>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {comment.author_name}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {timeAgo(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed pl-9">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div className="relative">
          <textarea
            placeholder="Share your thoughts, appreciation, or suggestions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold/50 transition-colors resize-none"
          />
          <span className="absolute bottom-2 right-3 font-mono text-[10px] text-muted/40">
            {content.length}/500
          </span>
        </div>

        {error && (
          <p className="font-mono text-[10px] text-red-400">{error}</p>
        )}
        {success && (
          <p className="font-mono text-[10px] text-green-400">
            Comment posted successfully!
          </p>
        )}

        <button
          type="submit"
          disabled={!name.trim() || !content.trim() || submitting}
          className="inline-flex items-center gap-2 font-mono text-xs bg-gold text-background px-4 py-2 rounded-lg hover:bg-gold/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          POST COMMENT
        </button>
      </form>
    </div>
  );
}
