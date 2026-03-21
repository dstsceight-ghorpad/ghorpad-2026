"use client";

import { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  PenTool,
  Palette,
  ChevronRight,
  ChevronLeft,
  Check,
  Send,
  Tag,
  User,
  Users,
  Upload,
  Loader2,
  X,
  Paperclip,
} from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { saveSubmission } from "@/lib/submissions";
import { CATEGORIES, DIVISIONS } from "@/types";
import type {
  SubmissionType,
  ContributorType,
  Submission,
  GalleryCategory,
  Division,
} from "@/types";

// ── Submission type options ──────────────────────────────────────────────────

const submissionTypes = [
  {
    type: "article" as SubmissionType,
    label: "Article",
    description: "Written piece — news, opinion, feature, or review",
    icon: FileText,
  },
  {
    type: "photo" as SubmissionType,
    label: "Photo",
    description: "Photos from campus events, training, or campus life",
    icon: ImageIcon,
  },
  {
    type: "poem" as SubmissionType,
    label: "Poem",
    description: "Poetry and creative verse",
    icon: PenTool,
  },
  {
    type: "sketch" as SubmissionType,
    label: "Sketch",
    description: "Artwork, illustrations, or creative sketches",
    icon: Palette,
  },
];

// ── Gallery categories for photos ────────────────────────────────────────────

const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Ceremonies",
  "CAPSTAR",
  "Cultural",
  "Social",
  "Guest Lectures",
  "Sports",
  "Campus",
  "Adventures",
  "Families",
  "Creative",
];

// ── Category descriptions ────────────────────────────────────────────────────

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
  // Gallery categories
  Ceremonies: "Passing out parades, commissioning, and formal events",
  CAPSTAR: "CAPSTAR competition events and activities",
  Cultural: "Cultural programmes and celebrations",
  Social: "Social gatherings and community events",
  "Guest Lectures": "Lectures, talks, and seminars",
  Adventures: "Trekking, expeditions, and outdoor activities",
  Families: "Family day events and gatherings",
  Creative: "Art, creativity, and expression",
};

// ── Category-specific writing templates ──────────────────────────────────────

const categoryTemplates: Record<string, string> = {
  Campus: `[HEADLINE — What happened / What is this about?]

[INTRODUCTION — Set the scene. When and where did this take place? Why is it significant?]

[BODY — Describe the event, activity, or development in detail. Include key participants, highlights, and outcomes.]

[IMPACT — How does this affect the campus community? What are the takeaways?]

[CONCLUSION — Wrap up with a forward-looking statement or reflection.]`,

  Culture: `[TITLE — Name the cultural event, tradition, or experience]

[CONTEXT — What is the cultural significance? Provide background.]

[NARRATIVE — Describe the experience in vivid detail.]

[PERSONAL REFLECTION — What did this mean to you or the participants?]

[CLOSING THOUGHT — A unifying message or takeaway.]`,

  Opinion: `[HEADLINE — A clear, engaging statement of your position]

[OPENING — Introduce the topic and state your thesis clearly.]

[ARGUMENT 1 — Present your first supporting point with evidence.]

[ARGUMENT 2 — Present your second supporting point. Address counterarguments.]

[CONCLUSION — Restate your position and leave a thought-provoking closing.]

Note: Opinion pieces reflect the author's personal views.`,

  Sports: `[HEADLINE — Sport, event name, and result/outcome]

[MATCH/EVENT SUMMARY — Date, venue, teams/participants, and result.]

[KEY MOMENTS — Describe turning points and standout performances.]

[TEAM SPIRIT — Capture the atmosphere and camaraderie.]

[LOOKING AHEAD — Upcoming fixtures or reflections on the season.]`,

  Tech: `[TITLE — The technology or concept you are writing about]

[INTRODUCTION — What is this technology? Why should we care?]

[EXPLANATION — Break down how it works in accessible language.]

[DEFENCE APPLICATION — How is this relevant to defence or military operations?]

[FUTURE OUTLOOK — Where is this technology headed?]`,

  Achievements: `[HEADLINE — Who achieved what?]

[THE ACHIEVEMENT — What was accomplished, by whom, and when.]

[JOURNEY — The effort and preparation that led to this achievement.]

[SIGNIFICANCE — Why does this matter? How does it inspire the community?]

[IN THEIR OWN WORDS (Optional) — A brief quote from the achiever.]`,

  "Ladies Corner": `[TITLE — A compelling title for your piece]

[INTRODUCTION — Set the context. What is this article about?]

[NARRATIVE — Share the story, experience, or perspective.]

[REFLECTION — What are the key insights or lessons?]

[CLOSING — End with an uplifting or thought-provoking message.]`,

  "International Perspectives": `[TITLE — Country/Region and the topic of your perspective]

[INTRODUCTION — Introduce yourself, your country, and the topic.]

[PERSPECTIVE — Share your unique viewpoint shaped by your background.]

[COMPARISON — Draw parallels or contrasts with what you have observed here.]

[TAKEAWAY — What can we learn from each other?]`,

  Poems: `[TITLE OF POEM]

[Your poem here — free verse, rhyming, or any style you prefer.]




---
Note: Please include a brief note (2-3 lines) about the inspiration behind your poem.`,
};

const RELATIONS = ["Wife of", "Son of", "Daughter of"];

// ── Component ────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<SubmissionType | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
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

  // Get applicable categories based on submission type
  const getCategories = (): string[] => {
    if (type === "photo") return [...GALLERY_CATEGORIES];
    if (type === "poem") return ["Poems"];
    if (type === "sketch") return ["Creative"];
    // articles get full CATEGORIES list
    return [...CATEGORIES];
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/submissions/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      setAttachmentUrl(data.url);
      setAttachmentName(file.name);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected
      e.target.value = "";
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl("");
    setAttachmentName("");
    setUploadError("");
  };

  // Whether this type accepts images or documents
  const isImageType = type === "photo" || type === "sketch";
  const acceptedFileTypes = isImageType
    ? ".jpg,.jpeg,.png"
    : ".pdf,.doc,.docx";
  const fileTypeLabel = isImageType
    ? "Upload Image (JPEG or PNG)"
    : "Upload Document (PDF or Word)";

  const handleSubmit = async () => {
    if (!type || !category || !title || !authorName) return;
    // Require either content or attachment
    if (!content && !attachmentUrl) return;
    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");

    const id = `sub-${Date.now()}`;

    // Build display name for family members
    let displayName = authorName;
    if (contributorType === "family" && relation && officerName) {
      displayName = `${authorName}, ${relation} ${officerName}`;
    }

    const submission: Submission = {
      id,
      type,
      category,
      title,
      author_name: displayName,
      author_email: authorEmail || "",
      author_division: (authorDivision as Division) || undefined,
      contributor_type: contributorType,
      relation: contributorType === "family" ? relation || undefined : undefined,
      officer_name: contributorType === "family" ? officerName || undefined : undefined,
      content: content || `[See attached file: ${attachmentName}]`,
      attachment_url: attachmentUrl || undefined,
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

  // When category changes, pre-fill the template if content is empty or still a template
  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    if (type === "article" || type === "poem") {
      if (!content || content.startsWith("[")) {
        setContent(categoryTemplates[cat] || "");
      }
    }
  };

  // Auto-select category for poem/sketch since they have single categories
  const handleTypeSelect = (selectedType: SubmissionType) => {
    setType(selectedType);
    // Reset category when type changes
    setCategory(null);
    if (selectedType === "poem") {
      setCategory("Poems");
      if (!content || content.startsWith("[")) {
        setContent(categoryTemplates["Poems"] || "");
      }
    } else if (selectedType === "sketch") {
      setCategory("Creative");
    }
  };

  const canProceedStep2 = type !== null;
  const canProceedStep3 = category !== null;
  const canProceedStep4 =
    title &&
    (content || attachmentUrl) &&
    authorName &&
    (contributorType === "officer" || (relation && officerName));

  // For poem/sketch, skip category selection (step 2)
  const skipCategoryStep = type === "poem" || type === "sketch";

  const goNext = (currentStep: number) => {
    if (currentStep === 1 && skipCategoryStep) {
      setStep(3);
    } else {
      setStep(currentStep + 1);
    }
  };

  const goBack = (currentStep: number) => {
    if (currentStep === 3 && skipCategoryStep) {
      setStep(1);
    } else {
      setStep(currentStep - 1);
    }
  };

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
            Contribution Received!
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

  // Total visible steps
  const totalSteps = skipCategoryStep ? 3 : 4;
  const displayStep = (s: number) => {
    if (!skipCategoryStep) return s;
    // Map step 3→2, step 4→3 when skipping category
    if (s >= 3) return s - 1;
    return s;
  };

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            Contribute
          </h1>
          <p className="text-muted leading-relaxed">
            Share your voice with the GHORPAD community. All contributions are
            reviewed by our editorial team before publishing.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
            const actualStep = displayStep(step);
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-all ${
                    actualStep >= s
                      ? "bg-gold text-background"
                      : "bg-surface-light text-muted border border-border-subtle"
                  }`}
                >
                  {actualStep > s ? <Check size={14} /> : s}
                </div>
                {s < totalSteps && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 transition-all ${
                      actualStep > s ? "bg-gold" : "bg-border-subtle"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Type selection ────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-6">
              STEP 1: WHAT WOULD YOU LIKE TO CONTRIBUTE?
            </h2>
            {submissionTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.type;

              return (
                <button
                  key={item.type}
                  onClick={() => handleTypeSelect(item.type)}
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
                onClick={() => canProceedStep2 && goNext(1)}
                disabled={!canProceedStep2}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                NEXT
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Category selection (skipped for poem/sketch) ─────── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-2">
              STEP 2: SELECT CATEGORY
            </h2>
            <p className="text-center text-xs text-muted mb-6">
              {type === "photo"
                ? "Choose the gallery section for your photo"
                : "Choose the category that best fits your article"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getCategories().map((cat) => {
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
                      {categoryDescriptions[cat] && (
                        <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                          {categoryDescriptions[cat]}
                        </p>
                      )}
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
                onClick={() => goBack(2)}
                className="flex items-center gap-2 font-mono text-xs text-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} />
                BACK
              </button>
              <button
                onClick={() => canProceedStep3 && goNext(2)}
                disabled={!canProceedStep3}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                NEXT
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Content + Contributor Info ──────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-mono text-xs text-gold tracking-widest text-center mb-2">
              {skipCategoryStep ? "STEP 2" : "STEP 3"}: YOUR CONTENT &amp; DETAILS
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
                TITLE *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === "photo"
                    ? "Photo title or caption"
                    : type === "poem"
                      ? "Title of your poem"
                      : type === "sketch"
                        ? "Title of your sketch"
                        : "Article title"
                }
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                {fileTypeLabel.toUpperCase()} *
              </label>

              {!attachmentUrl ? (
                <div className="relative">
                  <label
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                      uploading
                        ? "border-gold/30 bg-gold/5"
                        : "border-border-subtle hover:border-gold/50 hover:bg-surface-light"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={28} className="text-gold animate-spin" />
                        <span className="font-mono text-xs text-muted">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-muted" />
                        <div className="text-center">
                          <span className="text-sm font-medium block">
                            Click to browse and upload
                          </span>
                          <span className="font-mono text-[10px] text-muted mt-1 block">
                            {isImageType
                              ? "JPEG or PNG • Max 10 MB"
                              : "PDF or Word (.doc, .docx) • Max 10 MB"}
                          </span>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept={acceptedFileTypes}
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  {isImageType ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={attachmentUrl}
                      alt="Upload preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <Paperclip size={18} className="text-gold" />
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

            {/* Text Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[10px] text-muted tracking-widest">
                  {type === "photo"
                    ? "CAPTION / DESCRIPTION"
                    : type === "poem"
                      ? "YOUR POEM (or upload above)"
                      : type === "sketch"
                        ? "CAPTION / DESCRIPTION"
                        : "ARTICLE CONTENT (or upload above)"}{" "}
                  {attachmentUrl ? "" : "*"}
                </label>
                {(type === "article" || type === "poem") && !attachmentUrl && (
                  <span className="font-mono text-[9px] text-muted/60">
                    Follow the template for best results
                  </span>
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={type === "photo" || type === "sketch" ? 4 : attachmentUrl ? 4 : 16}
                placeholder={
                  attachmentUrl
                    ? "Add an optional caption or note about your uploaded file"
                    : type === "photo"
                      ? "Describe the photo — event, date, people pictured, and context"
                      : type === "sketch"
                        ? "Describe your sketch — inspiration, medium used, and any context"
                        : undefined
                }
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-gold transition-all font-mono leading-relaxed"
              />
              {(type === "article" || type === "poem") && !attachmentUrl && content.startsWith("[") && (
                <p className="font-mono text-[9px] text-muted/50 mt-1.5">
                  Replace the [bracketed prompts] with your content. You may add
                  or remove sections as needed.
                </p>
              )}
            </div>

            {/* Contributor Info */}
            <div className="border-t border-border-subtle pt-6">
              <span className="font-mono text-[10px] text-muted tracking-widest mb-4 block">
                CONTRIBUTOR INFORMATION
              </span>

              {/* Contributor type toggle */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setContributorType("officer")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border font-mono text-xs transition-all ${
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border font-mono text-xs transition-all ${
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
                          ? "e.g. Capt Arjun Singh"
                          : "e.g. Priya"
                      }
                      className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                      DIVISION
                    </label>
                    <select
                      value={authorDivision}
                      onChange={(e) => setAuthorDivision(e.target.value as Division | "")}
                      className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
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
                        className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
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
                        placeholder="e.g. Capt Arjun Singh"
                        className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                      />
                    </div>
                    {authorName && relation && officerName && (
                      <div className="sm:col-span-2">
                        <span className="font-mono text-[10px] text-muted block mb-1">
                          CONTRIBUTOR DISPLAY NAME
                        </span>
                        <span className="text-sm text-gold">
                          {authorName}, {relation} {officerName}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                    EMAIL (OPTIONAL)
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => goBack(3)}
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
              {skipCategoryStep ? "STEP 3" : "STEP 4"}: REVIEW &amp; SUBMIT
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
              {attachmentUrl && (
                <div>
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    ATTACHMENT
                  </span>
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-gold shrink-0" />
                    <span className="text-sm text-gold truncate">{attachmentName}</span>
                  </div>
                </div>
              )}
              {content && (
                <div>
                  <span className="font-mono text-[10px] text-muted block mb-1">
                    {attachmentUrl ? "NOTES" : "CONTENT PREVIEW"}
                  </span>
                  <p className="text-sm text-muted leading-relaxed line-clamp-6 whitespace-pre-line">
                    {content}
                  </p>
                </div>
              )}
              <div className="border-t border-border-subtle pt-4">
                <span className="font-mono text-[10px] text-muted block mb-1">
                  CONTRIBUTED BY
                </span>
                <span className="text-sm">
                  {contributorType === "family" && relation && officerName
                    ? `${authorName}, ${relation} ${officerName}`
                    : authorName}
                </span>
                {authorDivision && (
                  <span className="font-mono text-[10px] text-muted block mt-0.5">
                    Division: {authorDivision}
                  </span>
                )}
                {authorEmail && (
                  <span className="font-mono text-[10px] text-muted block mt-0.5">
                    {authorEmail}
                  </span>
                )}
              </div>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(3)}
                disabled={submitting}
                className="flex items-center gap-2 font-mono text-xs text-muted hover:text-foreground transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                BACK
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                {submitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
