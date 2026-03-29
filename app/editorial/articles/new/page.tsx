"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Check, Loader2, FileUp, FileText, AlertCircle, LayoutTemplate } from "lucide-react";
import dynamic from "next/dynamic";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useUser } from "../../layout";
import { canPublish } from "@/lib/auth";
import { generateSlug, estimateReadTime, extractTextFromTipTap, cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import type { ArticleStatus } from "@/types";
import { parseArticleFile } from "@/lib/article-parser";
import type { ArticleTemplate } from "@/lib/article-templates";
import { findSimilarArticles } from "@/lib/similarity";

const TipTapEditor = dynamic(
  () => import("@/components/editorial/TipTapEditor"),
  { ssr: false }
);
const TemplatePicker = dynamic(
  () => import("@/components/editorial/TemplatePicker"),
  { ssr: false }
);
const PublishChecklist = dynamic(
  () => import("@/components/editorial/PublishChecklist"),
  { ssr: false }
);
const ContentChecker = dynamic(
  () => import("@/components/editorial/ContentChecker"),
  { ssr: false }
);
const SimilarityWarning = dynamic(
  () => import("@/components/editorial/SimilarityWarning"),
  { ssr: false }
);

export default function NewArticlePage() {
  const { profile } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New feature states
  const [showTemplatePicker, setShowTemplatePicker] = useState(true);
  const [showPublishChecklist, setShowPublishChecklist] = useState(false);
  const [similarityMatches, setSimilarityMatches] = useState<ReturnType<typeof findSimilarArticles>>([]);
  const [showSimilarityWarning, setShowSimilarityWarning] = useState(false);
  const editorTextRef = useRef("");

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  // Auto-save every 30s
  useEffect(() => {
    if (!title) return;
    const timer = setInterval(() => {
      handleSave("draft", true);
    }, 30000);
    return () => clearInterval(timer);
  }, [title, content, excerpt, category]);

  // Keep editor text ref updated
  useEffect(() => {
    if (content) {
      editorTextRef.current = extractTextFromTipTap(content);
    }
  }, [content]);

  const handleSave = useCallback(
    async (saveStatus?: ArticleStatus, isAutoSave = false) => {
      if (!title || !profile) return;
      setSaving(true);

      const statusToSave = saveStatus || status;
      const supabase = createBrowserSupabaseClient();

      const articleData = {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverImageUrl || null,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: statusToSave,
        is_featured: isFeatured,
        author_id: profile.id,
        read_time_minutes: estimateReadTime(content),
        updated_at: new Date().toISOString(),
        ...(statusToSave === "published" && !articleId
          ? { published_at: new Date().toISOString() }
          : {}),
      };

      if (articleId) {
        await supabase.from("articles").update(articleData).eq("id", articleId);
      } else {
        const { data } = await supabase
          .from("articles")
          .insert(articleData)
          .select("id")
          .single();
        if (data) setArticleId(data.id);
      }

      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (!isAutoSave && statusToSave === "published") {
        router.push("/editorial/dashboard");
      }
    },
    [title, slug, excerpt, content, coverImageUrl, category, tags, isFeatured, status, profile, articleId, router]
  );

  const handlePublishClick = () => {
    // Run similarity check first
    const text = editorTextRef.current;
    const existingArticles = ([] as { id: string; title: string; excerpt: string }[]).map((a) => ({
      id: a.id,
      title: a.title,
      text: a.excerpt || "",
    }));
    const matches = findSimilarArticles(text, existingArticles);

    if (matches.length > 0) {
      setSimilarityMatches(matches);
      setShowSimilarityWarning(true);
    } else {
      setShowPublishChecklist(true);
    }
  };

  const handleSimilarityProceed = () => {
    setShowSimilarityWarning(false);
    setShowPublishChecklist(true);
  };

  const handlePublishConfirm = () => {
    setShowPublishChecklist(false);
    handleSave("published");
  };

  const handleTemplateSelect = (template: ArticleTemplate) => {
    if (template.id !== "blank") {
      setContent(template.content);
      if (template.category) {
        setCategory(template.category);
      }
    }
    setShowTemplatePicker(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const supabase = createBrowserSupabaseClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `cover-${Date.now()}-${safeName}`;

      const { data, error } = await supabase.storage
        .from("article-covers")
        .upload(filename, file, { contentType: file.type, upsert: true, cacheControl: "86400" });

      if (error) {
        console.error("Cover upload failed:", error);
        alert("Cover image upload failed: " + error.message);
        return;
      }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from("article-covers")
          .getPublicUrl(data.path);
        setCoverImageUrl(publicUrl);
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      alert("Failed to upload cover image");
    }
  };

  const handleArticleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingFile(true);

    try {
      const result = await parseArticleFile(file);

      if (result.type === "error") {
        setUploadError(result.message);
      } else if (result.type === "json") {
        setContent(result.data as Record<string, unknown>);
      } else if (result.type === "html") {
        setContent({ __html: result.data } as unknown as Record<string, unknown>);
      }
    } catch {
      setUploadError("Failed to read the uploaded file. Please try again.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getEditorText = () => editorTextRef.current;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">New Article</h1>
          <p className="font-mono text-xs text-muted mt-1">
            // CREATE &middot; EDIT &middot; PUBLISH
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Template button */}
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="flex items-center gap-2 bg-surface border border-border-subtle font-mono text-xs px-3 py-2.5 rounded-lg hover:border-gold/50 transition-all"
          >
            <LayoutTemplate size={14} />
            TEMPLATE
          </button>

          {/* Save indicator */}
          {(saving || saved) && (
            <span className="font-mono text-xs text-muted flex items-center gap-1">
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={12} className="text-green-400" />
                  Saved
                </>
              )}
            </span>
          )}

          <button
            onClick={() => handleSave("draft")}
            className="flex items-center gap-2 bg-surface border border-border-subtle font-mono text-xs px-4 py-2.5 rounded-lg hover:border-gold/50 transition-all"
          >
            <Save size={14} />
            SAVE DRAFT
          </button>

          {profile?.role && canPublish(profile.role) && (
            <button
              onClick={handlePublishClick}
              className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
            >
              <Eye size={14} />
              PUBLISH
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
            className="w-full bg-transparent text-3xl font-serif font-bold placeholder:text-muted/30 focus:outline-none"
          />

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief excerpt..."
            rows={2}
            className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-sm resize-none placeholder:text-muted/50 focus:outline-none focus:border-gold transition-all"
          />

          {/* Article File Upload */}
          <div className="border border-dashed border-border-subtle rounded-lg p-4 hover:border-gold/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-light rounded-lg">
                <FileUp size={18} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-foreground mb-0.5">
                  UPLOAD ARTICLE FILE
                </p>
                <p className="font-mono text-[10px] text-muted">
                  .TXT &middot; .MD &middot; .DOCX &mdash; content will populate the editor below
                </p>
              </div>
              <label className="shrink-0 cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.markdown,.docx"
                  onChange={handleArticleFileUpload}
                  className="hidden"
                />
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 font-mono text-xs px-4 py-2 rounded border transition-all",
                    uploadingFile
                      ? "border-gold/30 text-muted cursor-wait"
                      : "border-gold/50 text-gold hover:bg-gold hover:text-background"
                  )}
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      PARSING...
                    </>
                  ) : (
                    <>
                      <FileText size={12} />
                      CHOOSE FILE
                    </>
                  )}
                </span>
              </label>
            </div>
            {uploadError && (
              <div className="flex items-center gap-2 mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                <AlertCircle size={14} className="shrink-0" />
                <p className="font-mono text-[11px]">{uploadError}</p>
              </div>
            )}
          </div>

          {/* Editor */}
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Slug */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              SLUG
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gold transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              TAGS (COMMA-SEPARATED)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tech, campus, events"
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              COVER IMAGE
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="w-full text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-surface-light file:text-sm file:text-foreground file:cursor-pointer cursor-pointer"
            />
            {coverImageUrl && (
              <p className="font-mono text-[10px] text-green-400 mt-2">
                Cover image uploaded
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              {profile?.role && canPublish(profile.role) && (
                <option value="published">Published</option>
              )}
            </select>
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                isFeatured ? "bg-gold" : "bg-surface-light border border-border-subtle"
              )}
              onClick={() => setIsFeatured(!isFeatured)}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform",
                  isFeatured ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </div>
            <span className="font-mono text-xs text-muted">
              FEATURED ARTICLE
            </span>
          </label>

          {/* Content Checker */}
          <ContentChecker getText={getEditorText} />
        </div>
      </div>

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Publish Checklist Modal */}
      {showPublishChecklist && (
        <PublishChecklist
          formData={{
            title,
            excerpt,
            coverImageUrl,
            category,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            content,
          }}
          onConfirm={handlePublishConfirm}
          onClose={() => setShowPublishChecklist(false)}
        />
      )}

      {/* Similarity Warning Modal */}
      {showSimilarityWarning && (
        <SimilarityWarning
          matches={similarityMatches}
          onProceed={handleSimilarityProceed}
          onGoBack={() => setShowSimilarityWarning(false)}
        />
      )}
    </div>
  );
}
