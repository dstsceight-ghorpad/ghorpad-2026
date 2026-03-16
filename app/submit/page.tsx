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
  Tag,
} from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { saveSubmission } from "@/lib/submissions";
import { CATEGORIES } from "@/types";
import type { SubmissionType, Submission } from "@/types";

// ── Submission type options ──────────────────────────────────────────────────

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
    description:
      "Write a letter to the editorial team with feedback or thoughts",
    icon: Mail,
  },
];

// ── Category-specific writing templates ──────────────────────────────────────

const categoryTemplates: Record<string, string> = {
  Campus: `[HEADLINE — What happened / What is this about?]

[INTRODUCTION — Set the scene. When and where did this take place? Why is it significant to the DSTSC community?]

[BODY — Describe the event, activity, or development in detail. Include key participants, highlights, and outcomes.]

[IMPACT — How does this affect the campus community? What are the takeaways?]

[CONCLUSION — Wrap up with a forward-looking statement or reflection.]`,

  Culture: `[TITLE — Name the cultural event, tradition, or experience]

[CONTEXT — What is the cultural significance? Provide background for readers who may not be familiar.]

[NARRATIVE — Describe the experience, celebration, or tradition in vivid detail. Paint a picture for the reader.]

[PERSONAL REFLECTION — What did this mean to you or the participants? How does it connect diverse backgrounds at DSTSC?]

[CLOSING THOUGHT — A unifying message or takeaway about cultural exchange.]`,

  Opinion: `[HEADLINE — A clear, engaging statement of your position]

[OPENING — Introduce the topic and state your thesis clearly. Why does this matter?]

[ARGUMENT 1 — Present your first supporting point with evidence or examples.]

[ARGUMENT 2 — Present your second supporting point. Address potential counterarguments.]

[ARGUMENT 3 (Optional) — Additional supporting evidence or perspective.]

[CONCLUSION — Restate your position and leave the reader with a thought-provoking closing.]

Note: Opinion pieces reflect the author's personal views and do not represent the views of the editorial team or MILIT.`,

  Sports: `[HEADLINE — Sport, event name, and result/outcome]

[MATCH/EVENT SUMMARY — Date, venue, teams/participants, and final result.]

[KEY MOMENTS — Describe the turning points, standout performances, or memorable plays.]

[PLAYER HIGHLIGHTS — Name the top performers and their contributions.]

[TEAM SPIRIT — Capture the atmosphere, sportsmanship, and camaraderie.]

[LOOKING AHEAD — Upcoming fixtures, training goals, or reflections on the season.]`,

  Tech: `[TITLE — The technology, innovation, or concept you are writing about]

[INTRODUCTION — What is this technology? Why should the DSTSC community care?]

[EXPLANATION — Break down how it works in simple, accessible language. Avoid excessive jargon.]

[MILITARY/DEFENCE APPLICATION — How is this relevant to defence, strategy, or military operations?]

[FUTURE OUTLOOK — Where is this technology headed? What should officers be aware of?]

[REFERENCES (Optional) — Cite any sources or further reading.]`,

  Achievements: `[HEADLINE — Who achieved what?]

[THE ACHIEVEMENT — Clearly state what was accomplished, by whom, and when.]

[JOURNEY — Describe the effort, preparation, or journey that led to this achievement.]

[SIGNIFICANCE — Why does this matter? How does it inspire the DSTSC community?]

[RECOGNITION — Any awards, citations, or words of appreciation received.]

[IN THEIR OWN WORDS (Optional) — A brief quote from the achiever.]`,

  "Ladies Corner": `[TITLE — A compelling title for your piece]

[INTRODUCTION — Set the context. What is this article about and why is it relevant?]

[NARRATIVE — Share the story, experience, insight, or perspective. This could be personal, observational, or informative.]

[REFLECTION — What are the key insights or lessons? How does this connect to the broader community?]

[CLOSING — End with an uplifting or thought-provoking message.]`,

  "International Perspectives": `[TITLE — Country/Region and the topic of your perspective]

[INTRODUCTION — Briefly introduce yourself, your country, and the topic you wish to discuss.]

[PERSPECTIVE — Share your unique viewpoint shaped by your national or cultural background. How does your experience differ from or align with what you have observed at DSTSC?]

[COMPARISON — Draw parallels or contrasts between your home country's approach and what you have learned here.]

[TAKEAWAY — What is the key message for your fellow officers? What can we learn from each other?]

[PERSONAL NOTE (Optional) — A personal anecdote that illustrates your point.]`,

  Poems: `[TITLE OF POEM]

[Your poem here — free verse, rhyming, or any style you prefer.]





---
Note: Please include a brief note (2-3 lines) about the inspiration behind your poem.`,
};

// ── Category descriptions for the selection grid ─────────────────────────────

const categoryDescriptions: Record<string, string> = {
  Campus: "Campus life, events, and institute happenings",
  Culture: "Cultural events, traditions, and celebrations",
  Opinion: "Personal viewpoints and thought-provoking commentary",
  Sports: "Sports events, matches, fitness, and team spirit",
  Tech: "Technology, innovation, and defence applications",
  Achievements: "Awards, accomplishments, and milestones",
  "Ladies Corner": "Stories, experiences, and perspectives",
  "International Perspectives": "Cross-cultural insights from international officers",
  Poems: "Poetry and creative verse",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<SubmissionType | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorBatch, setAuthorBatch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const handleSubmit = () => {
    if (!type || !category || !title || !content || !authorName || !authorEmail)
      return;

    const id = `sub-${Date.now()}`;
    const submission: Submission = {
      id,
      type,
      category,
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

  // When category changes, pre-fill the template if content is empty or still a template
  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    // Only pre-fill if content is empty or is still a template (starts with "[")
    if (!content || content.startsWith("[")) {
      setContent(categoryTemplates[cat] || "");
    }
  };

  const canProceedStep2 = type !== null;
  const canProceedStep3 = category !== null;
  const canProceedStep4 = title && content && authorName && authorEmail;

  // ── Success screen ──────────────────────────────────────────────────────────
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

  // ── Main form ───────────────────────────────────────────────────────────────
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

        {/* Progress bar — 4 steps now */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
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
              {s < 4 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 transition-all ${
                    step > s ? "bg-gold" : "bg-border-subtle"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Type selection ────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-6">
              STEP 1: CHOOSE SUBMISSION TYPE
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

        {/* ── Step 2: Category selection ────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-2">
              STEP 2: SELECT CATEGORY
            </h2>
            <p className="text-center text-xs text-muted mb-6">
              Choose the category that best fits your submission
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-left p-4 rounded-lg border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "border-gold bg-gold/5"
                        : "border-border-subtle hover:border-gold/30"
                    }`}
                  >
                    <Tag
                      size={16}
                      className={`shrink-0 mt-0.5 ${isSelected ? "text-gold" : "text-muted"}`}
                    />
                    <div className="min-w-0">
                      <h3
                        className={`font-serif text-sm font-semibold ${isSelected ? "text-gold" : ""}`}
                      >
                        {cat}
                      </h3>
                      <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                        {categoryDescriptions[cat]}
                      </p>
                    </div>
                    {isSelected && (
                      <Check
                        size={16}
                        className="text-gold shrink-0 mt-0.5 ml-auto"
                      />
                    )}
                  </button>
                );
              })}
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
                NEXT
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Write content with template ──────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-2">
              STEP 3: WRITE YOUR CONTENT
            </h2>
            {category && (
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1.5 bg-gold/10 text-gold font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-full">
                  <Tag size={10} />
                  {category.toUpperCase()}
                </span>
              </div>
            )}

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[10px] text-muted tracking-widest">
                  {type === "photo"
                    ? "DESCRIPTION"
                    : type === "letter"
                      ? "YOUR LETTER"
                      : "ARTICLE CONTENT"}
                </label>
                <span className="font-mono text-[9px] text-muted/60">
                  Follow the template structure for best results
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-gold transition-all font-mono leading-relaxed"
              />
              <p className="font-mono text-[9px] text-muted/50 mt-1.5">
                Replace the [bracketed prompts] with your content. You may add
                or remove sections as needed.
              </p>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <span className="font-mono text-[10px] text-muted tracking-widest mb-4 block">
                YOUR INFORMATION
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
                onClick={() => setStep(2)}
                className="flex items-center gap-2 font-mono text-xs text-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} />
                BACK
              </button>
              <button
                onClick={() => canProceedStep4 && setStep(4)}
                disabled={!canProceedStep4}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                REVIEW
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Submit ──────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-6">
              STEP 4: REVIEW & SUBMIT
            </h2>

            <div className="bg-surface border border-border-subtle rounded-lg p-5 space-y-4">
              <div className="flex gap-6">
                <div>
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    TYPE
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {type}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    CATEGORY
                  </span>
                  <span className="text-sm font-medium">{category}</span>
                </div>
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
                <p className="text-sm text-muted leading-relaxed line-clamp-6 whitespace-pre-line">
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
                onClick={() => setStep(3)}
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
