"use client";

import { useState } from "react";
import {
  Check,
  Upload,
  Loader2,
  X,
  Paperclip,
  User,
  Users,
  Send,
} from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { saveSubmission } from "@/lib/submissions";
import { DIVISIONS } from "@/types";
import type {
  SubmissionType,
  ContributorType,
  Submission,
  Division,
} from "@/types";

const RELATIONS = ["Wife of", "Son of", "Daughter of"];

/** Detect submission type from file extension */
function detectType(filename: string): SubmissionType {
  const ext = filename.toLowerCase().split(".").pop() || "";
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "photo";
  return "article";
}

/** Detect category from type */
function detectCategory(type: SubmissionType): string {
  if (type === "meme") return "Memes";
  if (type === "photo" || type === "sketch") return "Creative";
  if (type === "poem") return "Poems";
  return "Campus";
}

const SUBMISSION_CATEGORIES = ["Campus", "Culture", "Opinion", "Sports", "Tech", "Achievements", "Poems", "Memes"] as const;

export default function SubmitPage() {
  const [authorName, setAuthorName] = useState("");
  const [authorDivision, setAuthorDivision] = useState<Division | "">("");
  const [contributorType, setContributorType] = useState<ContributorType>("officer");
  const [relation, setRelation] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const res = await fetch("/api/submissions/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          type: file.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      const uploadRes = await fetch(data.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": data.contentType },
        body: file,
      });

      if (!uploadRes.ok) {
        setUploadError("File upload failed. Please try again.");
        return;
      }

      setAttachmentUrl(data.publicUrl);
      setAttachmentName(file.name);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl("");
    setAttachmentName("");
    setUploadError("");
  };

  const isImageFile = /\.(jpg|jpeg|png|gif)$/i.test(attachmentName);

  const canSubmit =
    attachmentUrl &&
    authorName.trim() &&
    (contributorType === "officer" || (relation && officerName));

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    const id = `sub-${Date.now()}`;
    const type: SubmissionType = selectedCategory === "Memes" ? "meme" : detectType(attachmentName);
    const category = selectedCategory || detectCategory(type);

    // Use filename (without extension) as title
    const title = attachmentName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    let displayName = authorName.trim();
    if (contributorType === "family" && relation && officerName) {
      displayName = `${authorName.trim()}, ${relation} ${officerName.trim()}`;
    }

    const submission: Submission = {
      id,
      type,
      category,
      title,
      author_name: displayName,
      author_email: "",
      author_division: (authorDivision as Division) || undefined,
      contributor_type: contributorType,
      relation: contributorType === "family" ? relation || undefined : undefined,
      officer_name: contributorType === "family" ? officerName.trim() || undefined : undefined,
      content: `[See attached file: ${attachmentName}]`,
      attachment_url: attachmentUrl,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      await saveSubmission(submission);
      setSubmissionId(id);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-32 pb-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3">
            Contribution Received!
          </h1>
          <p className="text-muted leading-relaxed mb-4">
            Thank you for your contribution. Our editorial team will review and
            publish your submission.
          </p>
          <div className="bg-surface border border-border-subtle rounded-lg p-4 inline-block mb-8">
            <span className="font-mono text-[10px] text-muted block mb-1">
              SUBMISSION ID
            </span>
            <span className="font-mono text-sm text-gold">{submissionId}</span>
          </div>
          <div>
            <a
              href="/"
              className="font-mono text-xs text-gold hover:text-gold/80 transition-colors"
            >
              &larr; BACK TO HOME
            </a>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // ── Main form ──
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            Contribute
          </h1>
          <p className="text-muted leading-relaxed text-sm">
            Upload your article, poem, sketch, photo, or meme for GHORPAD 2026.
            <br />
            Our editorial team will review and publish it.
          </p>
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-6">
          {/* ── File Upload ── */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
              UPLOAD YOUR CONTRIBUTION *
            </label>

            {!attachmentUrl ? (
              <div className="relative">
                <label
                  className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                    uploading
                      ? "border-gold/30 bg-gold/5"
                      : "border-border-subtle hover:border-gold/50 hover:bg-surface-light"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={32} className="text-gold animate-spin" />
                      <span className="font-mono text-xs text-muted">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-muted" />
                      <div className="text-center">
                        <span className="text-sm font-medium block">
                          Click to upload your file
                        </span>
                        <span className="font-mono text-[10px] text-muted mt-1 block">
                          JPEG, PNG, GIF, PDF, DOC, DOCX &bull; Max 10 MB
                        </span>
                      </div>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                {isImageFile ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={attachmentUrl}
                    alt="Upload preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <Paperclip size={20} className="text-gold" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">
                    {attachmentName}
                  </span>
                  <span className="font-mono text-[10px] text-green-400">
                    Uploaded successfully
                  </span>
                </div>
                <button
                  onClick={removeAttachment}
                  className="p-1.5 rounded-full text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {uploadError && (
              <p className="font-mono text-[10px] text-red-400 mt-1.5">
                {uploadError}
              </p>
            )}
          </div>

          {/* ── Category Selector ── */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
              CATEGORY (OPTIONAL)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-foreground font-mono focus:border-gold/50 focus:outline-none"
            >
              <option value="">Auto-detect</option>
              {SUBMISSION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* ── Contributor Info ── */}
          <div className="border-t border-border-subtle pt-5">
            <span className="font-mono text-[10px] text-muted tracking-widest mb-4 block">
              CONTRIBUTOR DETAILS
            </span>

            {/* Officer / Family toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setContributorType("officer")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-mono text-xs transition-all ${
                  contributorType === "officer"
                    ? "border-gold bg-gold/5 text-gold"
                    : "border-border-subtle text-muted hover:border-gold/30"
                }`}
              >
                <User size={14} />
                STUDENT OFFICER
              </button>
              <button
                onClick={() => setContributorType("family")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-mono text-xs transition-all ${
                  contributorType === "family"
                    ? "border-gold bg-gold/5 text-gold"
                    : "border-border-subtle text-muted hover:border-gold/30"
                }`}
              >
                <Users size={14} />
                FAMILY MEMBER
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                    YOUR NAME *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={
                      contributorType === "officer"
                        ? "e.g. Maj Arjun Singh"
                        : "e.g. Priya"
                    }
                    className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                    DIVISION *
                  </label>
                  <select
                    value={authorDivision}
                    onChange={(e) => setAuthorDivision(e.target.value as Division | "")}
                    className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                  >
                    <option value="">Select Division</option>
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {contributorType === "family" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-light rounded-lg border border-border-subtle">
                  <div>
                    <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                      RELATION *
                    </label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                    >
                      <option value="">Select Relation</option>
                      {RELATIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                      OFFICER&apos;S NAME *
                    </label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      placeholder="e.g. Maj Arjun Singh"
                      className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Submit ── */}
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full flex items-center justify-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3.5 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {submitting ? "SUBMITTING..." : "SUBMIT CONTRIBUTION"}
          </button>
        </div>

        <p className="text-center font-mono text-[10px] text-muted mt-6">
          All contributions are reviewed by the editorial team before publishing.
        </p>
      </div>
      <Footer />
    </main>
  );
}
