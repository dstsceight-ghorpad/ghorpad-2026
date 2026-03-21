"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  Mail,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  loadSubmissions,
  updateSubmissionStatus,
} from "@/lib/submissions";
import { formatDateShort } from "@/lib/utils";
import type { Submission, SubmissionStatus } from "@/types";

type FilterTab = "all" | "pending" | "approved" | "rejected";

const typeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  article: FileText,
  photo: ImageIcon,
  letter: Mail,
};

const statusColors: Record<SubmissionStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setError("");
      const data = await loadSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError("Failed to load submissions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: SubmissionStatus, notes?: string) => {
    setUpdating(true);
    try {
      await updateSubmissionStatus(id, status, notes);
      await loadData();
      setSelectedSubmission(null);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = submissions.filter((s) => {
    if (activeTab === "all") return true;
    return s.status === activeTab;
  });

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "ALL", count: submissions.length },
    {
      key: "pending",
      label: "PENDING",
      count: submissions.filter((s) => s.status === "pending").length,
    },
    {
      key: "approved",
      label: "APPROVED",
      count: submissions.filter((s) => s.status === "approved").length,
    },
    {
      key: "rejected",
      label: "REJECTED",
      count: submissions.filter((s) => s.status === "rejected").length,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Inbox size={20} className="text-gold" />
          <h1 className="font-serif text-2xl font-bold">Submissions</h1>
        </div>
        <p className="font-mono text-xs text-muted">
          // PUBLIC SUBMISSIONS &middot; {submissions.length} total
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

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <Loader2 size={32} className="mx-auto text-gold animate-spin mb-3" />
          <p className="font-mono text-xs text-muted">Loading submissions...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="font-mono text-xs text-red-400 mb-3">{error}</p>
          <button
            onClick={() => { setLoading(true); loadData(); }}
            className="font-mono text-xs text-gold hover:text-gold/80 transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Submissions table */}
      {!loading && !error && (
        <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    TYPE
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    TITLE
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    AUTHOR
                  </th>
                  <th className="font-mono text-[10px] text-muted tracking-widest px-4 py-3">
                    DATE
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
                {filtered.map((sub) => {
                  const TypeIcon = typeIcons[sub.type] || FileText;
                  return (
                    <tr key={sub.id} className="hover:bg-surface-light/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <TypeIcon size={14} className="text-muted" />
                          <span className="font-mono text-[10px] text-muted uppercase">
                            {sub.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium truncate block max-w-[200px]">
                          {sub.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted">{sub.author_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] text-muted">
                          {formatDateShort(sub.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded ${statusColors[sub.status]}`}
                        >
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="font-mono text-[10px] text-gold hover:text-gold/80 transition-colors"
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Inbox size={32} className="mx-auto text-muted/20 mb-3" />
              <p className="font-mono text-xs text-muted">
                No submissions in this category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-surface border border-border-subtle rounded-lg w-full max-w-xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border-subtle">
              <div>
                <h3 className="font-serif text-lg font-bold">
                  {selectedSubmission.title}
                </h3>
                <p className="font-mono text-[10px] text-muted mt-0.5">
                  {selectedSubmission.type.toUpperCase()} &middot;{" "}
                  {formatDateShort(selectedSubmission.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-muted hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="font-mono text-[10px] text-muted block mb-1">
                  AUTHOR
                </span>
                <p className="text-sm">
                  {selectedSubmission.author_name}
                </p>
                {selectedSubmission.author_division && (
                  <p className="font-mono text-[10px] text-muted mt-0.5">
                    Division: {selectedSubmission.author_division}
                  </p>
                )}
                {selectedSubmission.relation && selectedSubmission.officer_name && (
                  <p className="font-mono text-[10px] text-muted mt-0.5">
                    {selectedSubmission.relation} {selectedSubmission.officer_name}
                  </p>
                )}
              </div>

              {selectedSubmission.attachment_url && (
                <div>
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    ATTACHMENT
                  </span>
                  {/\.(jpg|jpeg|png)$/i.test(selectedSubmission.attachment_url) ? (
                    <div className="rounded-lg overflow-hidden border border-border-subtle">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedSubmission.attachment_url}
                        alt="Submission attachment"
                        className="w-full max-h-64 object-contain bg-black/20"
                      />
                    </div>
                  ) : (
                    <a
                      href={selectedSubmission.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gold/10 text-gold rounded-lg font-mono text-xs hover:bg-gold/20 transition-colors"
                    >
                      <FileText size={14} />
                      Download Attachment
                    </a>
                  )}
                </div>
              )}

              {selectedSubmission.content && (
                <div>
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    {selectedSubmission.attachment_url ? "NOTES" : "CONTENT"}
                  </span>
                  <div className="p-3 bg-surface-light rounded-lg text-sm leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                    {selectedSubmission.content}
                  </div>
                </div>
              )}

              {selectedSubmission.reviewer_notes && (
                <div>
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    REVIEWER NOTES
                  </span>
                  <p className="text-xs text-muted">{selectedSubmission.reviewer_notes}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-[10px] px-2 py-1 rounded ${
                    statusColors[selectedSubmission.status]
                  }`}
                >
                  {selectedSubmission.status.toUpperCase()}
                </span>
                {selectedSubmission.status === "approved" && selectedSubmission.article_id && (
                  <Link
                    href={`/editorial/articles/${selectedSubmission.article_id}/edit`}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] px-3 py-1 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors"
                  >
                    <ExternalLink size={12} />
                    EDIT DRAFT
                  </Link>
                )}
              </div>
            </div>

            {selectedSubmission.status === "pending" && (
              <div className="flex items-center gap-3 p-5 border-t border-border-subtle">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedSubmission.id, "approved")
                  }
                  disabled={updating}
                  className="flex-1 flex items-center justify-center gap-1.5 font-mono text-xs px-4 py-2.5 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  {updating ? "UPDATING..." : "APPROVE"}
                </button>
                <button
                  onClick={() => {
                    const notes = window.prompt("Reason for rejection:");
                    if (notes !== null) {
                      handleUpdateStatus(
                        selectedSubmission.id,
                        "rejected",
                        notes
                      );
                    }
                  }}
                  disabled={updating}
                  className="flex-1 flex items-center justify-center gap-1.5 font-mono text-xs px-4 py-2.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <XCircle size={14} />
                  REJECT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
