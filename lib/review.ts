import type { ReviewComment, ReviewDecision } from "@/types";

const REVIEW_COMMENTS_KEY = "ghorpad_review_comments";
const REVIEW_DECISIONS_KEY = "ghorpad_review_decisions";

// ─── Comments ────────────────────────────────────────────────

export function loadReviewComments(articleId: string): ReviewComment[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(REVIEW_COMMENTS_KEY);
  if (!raw) return [];
  try {
    const all: ReviewComment[] = JSON.parse(raw);
    return all.filter((c) => c.article_id === articleId);
  } catch {
    return [];
  }
}

export function saveReviewComment(comment: ReviewComment): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(REVIEW_COMMENTS_KEY);
  const all: ReviewComment[] = raw ? JSON.parse(raw) : [];
  all.push(comment);
  localStorage.setItem(REVIEW_COMMENTS_KEY, JSON.stringify(all));
}

export function resolveReviewComment(commentId: string): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(REVIEW_COMMENTS_KEY);
  if (!raw) return;
  const all: ReviewComment[] = JSON.parse(raw);
  const updated = all.map((c) =>
    c.id === commentId ? { ...c, resolved: true } : c
  );
  localStorage.setItem(REVIEW_COMMENTS_KEY, JSON.stringify(updated));
}

export function deleteReviewComment(commentId: string): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(REVIEW_COMMENTS_KEY);
  if (!raw) return;
  const all: ReviewComment[] = JSON.parse(raw);
  const filtered = all.filter((c) => c.id !== commentId);
  localStorage.setItem(REVIEW_COMMENTS_KEY, JSON.stringify(filtered));
}

// ─── Decisions ───────────────────────────────────────────────

export function loadReviewDecision(
  articleId: string
): ReviewDecision | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(REVIEW_DECISIONS_KEY);
  if (!raw) return null;
  try {
    const all: ReviewDecision[] = JSON.parse(raw);
    return all.find((d) => d.article_id === articleId) || null;
  } catch {
    return null;
  }
}

export function saveReviewDecision(decision: ReviewDecision): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(REVIEW_DECISIONS_KEY);
  const all: ReviewDecision[] = raw ? JSON.parse(raw) : [];
  const filtered = all.filter((d) => d.article_id !== decision.article_id);
  filtered.push(decision);
  localStorage.setItem(REVIEW_DECISIONS_KEY, JSON.stringify(filtered));
}
