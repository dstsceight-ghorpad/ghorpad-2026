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
import type { Article, TocEntry, GalleryItem, Personnel } from "@/types";

/** Fixed TOC section entries (not generated from articles) */
const FIXED_TOC_ENTRIES: TocEntry[] = [
  { id: "toc-1", title: "Commandant\u2019s Message", page_label: "01", category: "Leadership", type: "feature" },
  { id: "toc-2", title: "Who is Who", page_label: "02", category: "Leadership", type: "section" },
  { id: "toc-sk", title: "Sketches & Paintings", page_label: "\u2014", category: "Sketches & Paintings", type: "section" },
  { id: "toc-mb", title: "MILIT Babies", page_label: "\u2014", category: "MILIT Babies", type: "section", href: "#gallery?cat=Families" },
  { id: "toc-ev", title: "Organised Events", page_label: "\u2014", category: "Organised Events", type: "section" },
];

export const revalidate = 300; // revalidate every 5 minutes (reduces Supabase egress)

/**
 * Build Table of Contents entries from published articles.
 * Fixed section entries (Leadership, Sketches, etc.) are defined above.
 * Article/poem entries are generated dynamically from Supabase.
 */
function buildTocEntries(articles: Article[]): TocEntry[] {
  // Start with fixed section entries
  const entries: TocEntry[] = [...FIXED_TOC_ENTRIES];

  // Add published articles as TOC entries, grouped by category
  let pageNum = FIXED_TOC_ENTRIES.length + 1;

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

  // Fetch personnel from Supabase
  const { data: personnelData } = await supabase
    .from("personnel")
    .select("*")
    .order("personnel_role", { ascending: true })
    .order("sort_order", { ascending: true });

  const personnel: Personnel[] = (personnelData || []).map((p: Record<string, unknown>) => ({
    ...p,
    order: p.sort_order as number,
  })) as Personnel[];

  // Fetch gallery items from Supabase
  const { data: galleryData } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const galleryItems: GalleryItem[] = (galleryData || []) as GalleryItem[];

  return (
    <>
      <SplashGate />
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection headlines={tickerHeadlines} />
        {featuredArticle && <SpotlightSection article={featuredArticle} />}
        <TableOfContents entries={tocEntries} />
        <WhoIsWho personnel={personnel} />
        {articles.length > 0 && <ArticlesGrid articles={articles} />}
        <PhotoGallery items={galleryItems} />

        <MastheadStrip
          articleCount={articles.length}
          contributorCount={new Set(articles.map(a => a.contributor_name || a.author?.full_name).filter(Boolean)).size}
          galleryCount={galleryItems.length}
        />
        <Footer />
        <MagazineTrigger
          articles={articles}
          personnel={personnel}
          tocEntries={tocEntries}
          galleryItems={galleryItems}
          campusLocations={[]}
        />
      </main>
    </>
  );
}
