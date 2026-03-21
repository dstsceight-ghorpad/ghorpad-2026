import type { Submission, SubmissionStatus } from "@/types";

/**
 * Save a new submission via API (stores in Supabase).
 */
export async function saveSubmission(submission: Submission): Promise<void> {
  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to save submission");
  }
}

/**
 * Load all submissions via API (requires editorial auth).
 */
export async function loadSubmissions(): Promise<Submission[]> {
  const res = await fetch("/api/submissions");

  if (!res.ok) {
    console.error("Failed to load submissions:", res.status);
    return [];
  }

  return res.json();
}

/**
 * Update a submission's status via API (requires editorial auth).
 */
export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  notes?: string
): Promise<void> {
  const res = await fetch(`/api/submissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, reviewer_notes: notes }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update submission");
  }
}
