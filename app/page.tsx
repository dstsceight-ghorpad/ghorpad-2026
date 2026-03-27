import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import SpotlightSection from "@/components/public/SpotlightSection";
import TableOfContents from "@/components/public/TableOfContents";
import WhoIsWho from "@/components/public/WhoIsWho";
import ArticlesGrid from "@/components/public/ArticlesGrid";
import PhotoGallery from "@/components/public/PhotoGallery";
import MastheadStrip from "@/components/public/MastheadStrip";
import Footer from "@/components/public/Footer";
import MagazineTrigger from "@/components/public/MagazineTrigger";
import SplashGate from "@/components/public/SplashGate";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  samplePersonnel,
  sampleGalleryItems,
  fixedTocEntries,
} from "@/lib/sample-data";
import type { Article, TocEntry, GalleryItem } from "@/types";

export const revalidate = 60; // revalidate every 60 seconds

/**
 * Build Table of Contents entries from published articles.
 * Fixed section entries (Leadership, Sketches, etc.) come from sample-data.
 * Article/poem entries are generated dynamically from Supabase.
 */
function buildTocEntries(articles: Article[]): TocEntry[] {
  // Start with fixed section entries
  const entries: TocEntry[] = [...fixedTocEntries];

  // Add published articles as TOC entries, grouped by category
  let pageNum = fixedTocEntries.length + 1;

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

export default async function HomePage() {
  // Fetch published articles from Supabase
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("articles")
    .select("*, author:profiles!articles_author_id_fkey(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles: Article[] = data || [];

  // Rotate featured article: cycle through all articles based on the hour
  // Each article gets featured for ~1 hour, then it moves to the next
  const hourOfDay = new Date().getHours();
  const rotationIndex = articles.length > 0 ? hourOfDay % articles.length : 0;
  const featuredArticle = articles.length > 0 ? articles[rotationIndex] : null;
  const tocEntries = buildTocEntries(articles);

  // Generate ticker headlines from published articles (title + author)
  const tickerHeadlines = articles.map((a) => {
    const author = a.contributor_name || a.author?.full_name;
    return author ? `${a.title} — ${author}` : a.title;
  });

  // Fetch gallery items from database, fall back to sample data
  const { data: galleryData } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const allGalleryItems: GalleryItem[] =
    galleryData && galleryData.length > 0
      ? (galleryData as GalleryItem[])
      : sampleGalleryItems;

  const galleryItems = allGalleryItems;

  return (
    <>
      <SplashGate />
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection headlines={tickerHeadlines} />
        {featuredArticle && <SpotlightSection article={featuredArticle} />}
        <TableOfContents entries={tocEntries} />
        <WhoIsWho personnel={samplePersonnel} />
        {articles.length > 0 && <ArticlesGrid articles={articles} />}
        <PhotoGallery items={galleryItems} />

        <MastheadStrip />
        <Footer />
        <MagazineTrigger
          articles={articles}
          personnel={samplePersonnel}
          tocEntries={tocEntries}
          galleryItems={allGalleryItems}
          campusLocations={[]}
        />
      </main>
    </>
  );
}
