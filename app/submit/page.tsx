"use client";

import { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Mail,
  ChevronRight,
  ChevronLeft,
  Check,
  Send,
} from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { saveSubmission } from "@/lib/submissions";
import type { SubmissionType, Submission } from "@/types";

const submissionTypes = [
  {
    type: "article" as SubmissionType,
    label: "Article",
    description: "Submit a written piece — news, opinion, feature, or review",
    icon: FileText,
  },
  {
    type: "photo" as SubmissionType,
    label: "Photo",
    description: "Share photos from campus events, training, or campus life",
    icon: ImageIcon,
  },
  {
    type: "letter" as SubmissionType,
    label: "Letter to Editor",
    description: "Write a letter to the editorial team with feedback or thoughts",
    icon: Mail,
  },
];

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<SubmissionType | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorBatch, setAuthorBatch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const handleSubmit = () => {
    if (!type || !title || !content || !authorName || !authorEmail) return;

    const id = `sub-${Date.now()}`;
    const submission: Submission = {
      id,
      type,
      title,
      author_name: authorName,
      author_email: authorEmail,
      author_batch: authorBatch || undefined,
      content,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    saveSubmission(submission);
    setSubmissionId(id);
    setSubmitted(true);
  };

  const canProceedStep2 = type !== null;
  const canProceedStep3 = title && content && authorName && authorEmail;

  // Success screen
  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-32 pb-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3">
            Submission Received!
          </h1>
          <p className="text-muted leading-relaxed mb-4">
            Thank you for your contribution. Our editorial team will review your
            submission and get back to you.
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

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            Submit Content
          </h1>
          <p className="text-muted leading-relaxed">
            Share your voice with the GHORPAD community. All submissions are
            reviewed by our editorial team.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-all ${
                  step >= s
                    ? "bg-gold text-background"
                    : "bg-surface-light text-muted border border-border-subtle"
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 transition-all ${
                    step > s ? "bg-gold" : "bg-border-subtle"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Type selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-6">
              // STEP 1: CHOOSE SUBMISSION TYPE
            </h2>
            {submissionTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.type;

              return (
                <button
                  key={item.type}
                  onClick={() => setType(item.type)}
                  className={`w-full text-left p-5 rounded-lg border transition-all flex items-center gap-4 ${
                    isSelected
                      ? "border-gold bg-gold/5"
                      : "border-border-subtle hover:border-gold/30"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg shrink-0 ${
                      isSelected
                        ? "bg-gold/20 text-gold"
                        : "bg-surface-light text-muted"
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold">
                      {item.label}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check
                      size={20}
                      className="text-gold ml-auto shrink-0"
                    />
                  )}
                </button>
              );
            })}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => canProceedStep2 && setStep(2)}
                disabled={!canProceedStep2}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                NEXT
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details form */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-6">
              // STEP 2: FILL IN DETAILS
            </h2>

            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === "letter"
                    ? "Subject of your letter"
                    : type === "photo"
                      ? "Photo title or caption"
                      : "Article title"
                }
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                {type === "photo"
                  ? "DESCRIPTION"
                  : type === "letter"
                    ? "YOUR LETTER"
                    : "ARTICLE CONTENT"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === "photo"
                    ? "Describe the photo — when, where, what event..."
                    : type === "letter"
                      ? "Write your letter to the editor..."
                      : "Write your article content here..."
                }
                rows={type === "letter" ? 6 : 10}
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-gold transition-all"
              />
            </div>

            <div className="border-t border-border-subtle pt-6">
              <span className="font-mono text-xs text-gold tracking-widest mb-4 block">
                // YOUR INFORMATION
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                    YOUR NAME *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Capt Arjun Singh"
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                    BATCH (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={authorBatch}
                    onChange={(e) => setAuthorBatch(e.target.value)}
                    placeholder="e.g. DSTSC 08"
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 font-mono text-xs text-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} />
                BACK
              </button>
              <button
                onClick={() => canProceedStep3 && setStep(3)}
                disabled={!canProceedStep3}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                REVIEW
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-6">
              // STEP 3: REVIEW & SUBMIT
            </h2>

            <div className="bg-surface border border-border-subtle rounded-lg p-5 space-y-4">
              <div>
                <span className="font-mono text-[10px] text-muted block mb-1">
                  TYPE
                </span>
                <span className="text-sm font-medium capitalize">{type}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted block mb-1">
                  TITLE
                </span>
                <span className="text-sm font-medium">{title}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted block mb-1">
                  CONTENT PREVIEW
                </span>
                <p className="text-sm text-muted leading-relaxed line-clamp-4">
                  {content}
                </p>
              </div>
              <div className="border-t border-border-subtle pt-4">
                <span className="font-mono text-[10px] text-muted block mb-1">
                  SUBMITTED BY
                </span>
                <span className="text-sm">
                  {authorName} ({authorEmail})
                </span>
                {authorBatch && (
                  <span className="font-mono text-[10px] text-muted block mt-0.5">
                    Batch: {authorBatch}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 font-mono text-xs text-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} />
                BACK
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors"
              >
                <Send size={14} />
                SUBMIT
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
