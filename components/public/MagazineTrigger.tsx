"use client";

import { useState, useCallback } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Article, Personnel, TocEntry, GalleryItem, CampusLocation } from "@/types";

const MagazineReader = dynamic(() => import("./MagazineReader"), {
  ssr: false,
});

interface MagazineTriggerProps {
  articles: Article[];
  personnel: Personnel[];
  tocEntries: TocEntry[];
  galleryItems: GalleryItem[];
  campusLocations: CampusLocation[];
}

export default function MagazineTrigger({
  articles: serverArticles,
  personnel,
  tocEntries: serverTocEntries,
  galleryItems,
  campusLocations,
}: MagazineTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [freshArticles, setFreshArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch fresh articles client-side when the magazine opens
  // This ensures we always have the latest content, bypassing ISR cache
  const fetchFreshArticles = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("articles")
        .select("*, author:profiles!articles_author_id_fkey(*)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (data) {
        setFreshArticles(data as Article[]);
      }
    } catch {
      // Fall back to server-provided articles on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    fetchFreshArticles();
  }, [fetchFreshArticles]);

  // Use fresh articles if available, otherwise fall back to server-provided
  const articles = freshArticles || serverArticles;

  // Rebuild TOC entries when articles change
  const tocEntries = freshArticles
    ? buildTocEntries(freshArticles, serverTocEntries)
    : serverTocEntries;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-gold/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Read Magazine"
        >
          <BookOpen size={16} />
          <span className="hidden sm:inline">READ MAGAZINE</span>
        </button>
      )}

      {/* Magazine Reader Overlay */}
      {isOpen && (
        <>
          {loading && !freshArticles && (
            <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={32} className="mx-auto text-gold animate-spin mb-3" />
                <p className="font-mono text-xs text-muted">Loading magazine...</p>
              </div>
            </div>
          )}
          <MagazineReader
            articles={articles}
            personnel={personnel}
            tocEntries={tocEntries}
            galleryItems={galleryItems}
            campusLocations={campusLocations}
            onClose={() => {
              setIsOpen(false);
              setFreshArticles(null);
            }}
          />
        </>
      )}
    </>
  );
}

/**
 * Rebuild TOC entries using fresh articles + fixed section entries from server.
 */
function buildTocEntries(articles: Article[], serverTocEntries: TocEntry[]): TocEntry[] {
  // Keep fixed section entries (non-article/poem entries from the server TOC)
  const sectionEntries = serverTocEntries.filter(
    (e) => e.type !== "article" && e.type !== "poem"
  );

  const entries: TocEntry[] = [...sectionEntries];
  let pageNum = sectionEntries.length + 1;

  for (const article of articles) {
    const type: TocEntry["type"] =
      article.category === "Poems" ? "poem" : "article";

    entries.push({
      id: `toc-${article.id}`,
      title: article.title,
      page_label: String(pageNum).padStart(2, "0"),
      category: article.category,
      slug: article.slug,
      type,
      author: article.contributor_name || article.author?.full_name,
    });

    pageNum++;
  }

  return entries;
}
