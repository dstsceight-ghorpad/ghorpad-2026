"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Check,
  Trash2,
} from "lucide-react";
import {
  loadReviewComments,
  saveReviewComment,
  resolveReviewComment,
  deleteReviewComment,
  loadReviewDecision,
  saveReviewDecision,
} from "@/lib/review";
import type { ReviewComment, ReviewCommentType, ReviewAction } from "@/types";

const commentTypeLabels: Record<
  ReviewCommentType,
  { label: string; color: string }
> = {
  suggestion: { label: "SUGGESTION", color: "text-blue-400 bg-blue-400/10" },
  required_change: {
    label: "REQUIRED",
    color: "text-red-400 bg-red-400/10",
  },
  approval: { label: "APPROVAL", color: "text-green-400 bg-green-400/10" },
};

interface ReviewPanelProps {
  articleId: string;
  reviewerName: string;
  reviewerId: string;
}

export default function ReviewPanel({
  articleId,
  reviewerName,
  reviewerId,
}: ReviewPanelProps) {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<ReviewCommentType>("suggestion");
  const [decision, setDecision] = useState<ReturnType<typeof loadReviewDecision>>(null);

  useEffect(() => {
    setComments(loadReviewComments(articleId));
    setDecision(loadReviewDecision(articleId));
  }, [articleId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: ReviewComment = {
      id: `rc-${Date.now()}`,
      article_id: articleId,
      author_id: reviewerId,
      author_name: reviewerName,
      type: commentType,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      resolved: false,
    };

    saveReviewComment(comment);
    setComments(loadReviewComments(articleId));
    setNewComment("");
  };

  const handleResolve = (commentId: string) => {
    resolveReviewComment(commentId);
    setComments(loadReviewComments(articleId));
  };

  const handleDelete = (commentId: string) => {
    deleteReviewComment(commentId);
    setComments(loadReviewComments(articleId));
  };

  const handleDecision = (action: ReviewAction) => {
    const reason = window.prompt(
      `Provide a reason for ${action === "approve" ? "approval" : action === "reject" ? "rejection" : "requesting changes"}:`
    );
    if (reason === null) return;

    saveReviewDecision({
      article_id: articleId,
      action,
      reason: reason || "",
      decided_by: reviewerName,
      decided_at: new Date().toISOString(),
    });
    setDecision(loadReviewDecision(articleId));
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border-subtle">
        <MessageSquare size={14} className="text-gold" />
        <span className="font-mono text-[10px] text-gold tracking-widest">
          REVIEW PANEL
        </span>
        <span className="font-mono text-[10px] text-muted ml-auto">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Decision status */}
      {decision && (
        <div
          className={`mx-3 mt-3 p-3 rounded-lg border ${
            decision.action === "approve"
              ? "border-green-500/20 bg-green-500/5"
              : decision.action === "reject"
                ? "border-red-500/20 bg-red-500/5"
                : "border-yellow-500/20 bg-yellow-500/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {decision.action === "approve" ? (
              <CheckCircle2 size={14} className="text-green-400" />
            ) : decision.action === "reject" ? (
              <XCircle size={14} className="text-red-400" />
            ) : (
              <AlertTriangle size={14} className="text-yellow-400" />
            )}
            <span className="font-mono text-xs font-semibold">
              {decision.action === "approve"
                ? "APPROVED"
                : decision.action === "reject"
                  ? "REJECTED"
                  : "CHANGES REQUESTED"}
            </span>
          </div>
          {decision.reason && (
            <p className="text-xs text-muted ml-6">{decision.reason}</p>
          )}
          <p className="font-mono text-[9px] text-muted/60 ml-6 mt-1">
            by {decision.decided_by}
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {comments.length === 0 && (
          <p className="font-mono text-[10px] text-muted text-center py-4">
            No review comments yet.
          </p>
        )}

        {comments.map((comment) => {
          const typeInfo = commentTypeLabels[comment.type];
          return (
            <div
              key={comment.id}
              className={`p-2.5 rounded-lg border ${
                comment.resolved
                  ? "border-border-subtle/50 opacity-60"
                  : "border-border-subtle"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                <span className="font-mono text-[9px] text-muted">
                  {comment.author_name}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-2 mt-2">
                {!comment.resolved && (
                  <button
                    onClick={() => handleResolve(comment.id)}
                    className="font-mono text-[9px] text-green-400/70 hover:text-green-400 flex items-center gap-1 transition-colors"
                  >
                    <Check size={10} />
                    RESOLVE
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="font-mono text-[9px] text-red-400/50 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={10} />
                  DELETE
                </button>
                {comment.resolved && (
                  <span className="font-mono text-[9px] text-green-400/50 ml-auto">
                    RESOLVED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add comment */}
      <div className="p-3 border-t border-border-subtle">
        <div className="flex gap-2 mb-2">
          {(Object.keys(commentTypeLabels) as ReviewCommentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setCommentType(type)}
              className={`font-mono text-[9px] px-2 py-1 rounded transition-all ${
                commentType === type
                  ? commentTypeLabels[type].color
                  : "text-muted/50 hover:text-muted"
              }`}
            >
              {commentTypeLabels[type].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Add a review comment..."
            className="flex-1 bg-surface-light border border-border-subtle rounded px-3 py-2 text-xs focus:outline-none focus:border-gold/50 transition-colors"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="p-2 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Review actions */}
      <div className="p-3 border-t border-border-subtle">
        <span className="font-mono text-[9px] text-muted block mb-2">
          REVIEW DECISION:
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handleDecision("approve")}
            className="flex-1 flex items-center justify-center gap-1.5 font-mono text-[10px] px-3 py-2 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors"
          >
            <CheckCircle2 size={12} />
            APPROVE
          </button>
          <button
            onClick={() => handleDecision("request_changes")}
            className="flex-1 flex items-center justify-center gap-1.5 font-mono text-[10px] px-3 py-2 bg-yellow-500/10 text-yellow-400 rounded hover:bg-yellow-500/20 transition-colors"
          >
            <AlertTriangle size={12} />
            CHANGES
          </button>
          <button
            onClick={() => handleDecision("reject")}
            className="flex-1 flex items-center justify-center gap-1.5 font-mono text-[10px] px-3 py-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
          >
            <XCircle size={12} />
            REJECT
          </button>
        </div>
      </div>
    </div>
  );
}
