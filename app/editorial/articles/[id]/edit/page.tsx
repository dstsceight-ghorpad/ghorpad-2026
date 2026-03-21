"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Eye, Check, Loader2, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useUser } from "../../../layout";
import { canPublish } from "@/lib/auth";
import { generateSlug, estimateReadTime, extractTextFromTipTap, cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import type { ArticleStatus, Article } from "@/types";
import { sampleArticles } from "@/lib/sample-data";
import { findSimilarArticles } from "@/lib/similarity";

const TipTapEditor = dynamic(
  () => import("@/components/editorial/TipTapEditor"),
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
const ReviewPanel = dynamic(
  () => import("@/components/editorial/ReviewPanel"),
  { ssr: false }
);

export default function EditArticlePage() {
  const { profile } = useUser();
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

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
  const [loading, setLoading] = useState(true);
  const [contributorName, setContributorName] = useState("");

  // New feature states
  const [showPublishChecklist, setShowPublishChecklist] = useState(false);
  const [similarityMatches, setSimilarityMatches] = useState<ReturnType<typeof findSimilarArticles>>([]);
  const [showSimilarityWarning, setShowSimilarityWarning] = useState(false);
  const editorTextRef = useRef("");

  useEffect(() => {
    async function fetchArticle() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (data) {
        const article = data as Article;
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt);
        setCategory(article.category);
        setTags(article.tags.join(", "));
        setCoverImageUrl(article.cover_image_url || "");
        setIsFeatured(article.is_featured);
        setStatus(article.status);
        setContent(article.content);
        setContributorName(article.contributor_name || "");
      }
      setLoading(false);
    }

    fetchArticle();
  }, [articleId]);

  // Keep editor text ref updated
  useEffect(() => {
    if (content) {
      editorTextRef.current = extractTextFromTipTap(content);
    }
  }, [content]);

  const handleSave = useCallback(
    async (saveStatus?: ArticleStatus) => {
      if (!title || !profile) return;
      setSaving(true);

      const statusToSave = saveStatus || status;
      const supabase = createBrowserSupabaseClient();

      await supabase
        .from("articles")
        .update({
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
          contributor_name: contributorName || null,
          read_time_minutes: estimateReadTime(content),
          updated_at: new Date().toISOString(),
          ...(statusToSave === "published"
            ? { published_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", articleId);

      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (statusToSave === "published") {
        router.push("/editorial/dashboard");
      }
    },
    [title, slug, excerpt, content, coverImageUrl, category, tags, isFeatured, contributorName, status, profile, articleId, router]
  );

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createBrowserSupabaseClient();
    const filename = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("article-covers")
      .upload(filename, file, { contentType: file.type, upsert: false });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from("article-covers")
        .getPublicUrl(filename);
      setCoverImageUrl(publicUrl);
    }
  };

  const handlePublishClick = () => {
    const text = editorTextRef.current;
    const existingArticles = sampleArticles
      .filter((a) => a.id !== articleId)
      .map((a) => ({
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

  const getEditorText = () => editorTextRef.current;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-gold" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <Link
            href="/editorial/dashboard"
            className="flex items-center gap-1 font-mono text-xs text-muted hover:text-gold mb-2 transition-colors"
          >
            <ArrowLeft size={12} />
            BACK TO DASHBOARD
          </Link>
          <h1 className="font-serif text-2xl font-bold">Edit Article</h1>
        </div>

        <div className="flex items-center gap-3">
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
            SAVE
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
        <div className="lg:col-span-2 space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(generateSlug(e.target.value));
            }}
            placeholder="Article title..."
            className="w-full bg-transparent text-3xl font-serif font-bold placeholder:text-muted/30 focus:outline-none"
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief excerpt..."
            rows={2}
            className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-sm resize-none placeholder:text-muted/50 focus:outline-none focus:border-gold transition-all"
          />
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div className="space-y-6">
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
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              TAGS
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            />
          </div>
          {/* Cover Image */}
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              COVER IMAGE
            </label>
            {coverImageUrl && (
              <div className="relative mb-2 rounded-lg overflow-hidden border border-border-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => setCoverImageUrl("")}
                  className="absolute top-1 right-1 p-1 bg-background/80 rounded-full text-muted hover:text-foreground transition-colors"
                >
                  <span className="font-mono text-[9px]">✕</span>
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="w-full text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-surface-light file:text-sm file:text-foreground file:cursor-pointer cursor-pointer"
            />
          </div>

          {/* Contributor / Author Name */}
          {contributorName && (
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                CONTRIBUTOR
              </label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
              />
              <p className="font-mono text-[9px] text-muted mt-1">
                This name will appear as the article author
              </p>
            </div>
          )}

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
            <span className="font-mono text-xs text-muted">FEATURED</span>
          </label>

          {/* Content Checker */}
          <ContentChecker getText={getEditorText} />

          {/* Review Panel (shown when article is in review status) */}
          {status === "review" && profile && (
            <ReviewPanel
              articleId={articleId}
              reviewerName={profile.full_name || "Editor"}
              reviewerId={profile.id}
            />
          )}
        </div>
      </div>

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
