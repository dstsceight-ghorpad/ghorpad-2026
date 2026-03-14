import type { Submission, SubmissionStatus } from "@/types";

const SUBMISSIONS_KEY = "ghorpad_submissions";

export function loadSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SUBMISSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSubmission(submission: Submission): void {
  if (typeof window === "undefined") return;
  const all = loadSubmissions();
  all.push(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
}

export function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  notes?: string
): void {
  if (typeof window === "undefined") return;
  const all = loadSubmissions();
  const updated = all.map((s) =>
    s.id === id
      ? {
          ...s,
          status,
          reviewer_notes: notes || s.reviewer_notes,
          reviewed_at: new Date().toISOString(),
        }
      : s
  );
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
}

export function getSubmissionCount(): {
  pending: number;
  total: number;
} {
  const all = loadSubmissions();
  return {
    pending: all.filter((s) => s.status === "pending").length,
    total: all.length,
  };
}
