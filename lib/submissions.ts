import type { Submission, SubmissionStatus } from "@/types";

const SUBMISSIONS_KEY = "ghorpad_submissions";

export function loadDemoSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SUBMISSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDemoSubmission(submission: Submission): void {
  if (typeof window === "undefined") return;
  const all = loadDemoSubmissions();
  all.push(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
}

export function updateDemoSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  notes?: string
): void {
  if (typeof window === "undefined") return;
  const all = loadDemoSubmissions();
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

export function getDemoSubmissionCount(): {
  pending: number;
  total: number;
} {
  const all = loadDemoSubmissions();
  return {
    pending: all.filter((s) => s.status === "pending").length,
    total: all.length,
  };
}
