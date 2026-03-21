import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import SpotlightSection from "@/components/public/SpotlightSection";
import TableOfContents from "@/components/public/TableOfContents";
import WhoIsWho from "@/components/public/WhoIsWho";
import ArticlesGrid from "@/components/public/ArticlesGrid";
import PhotoGallery from "@/components/public/PhotoGallery";

import MastheadStrip from "@/components/public/MastheadStrip";
import CampusMap from "@/components/public/CampusMap";
import Footer from "@/components/public/Footer";
import MagazineTrigger from "@/components/public/MagazineTrigger";
import SplashGate from "@/components/public/SplashGate";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  samplePersonnel,
  sampleTocEntries,
  sampleCampusLocations,
  sampleGalleryItems,
  tickerHeadlines,
} from "@/lib/sample-data";
import type { Article } from "@/types";

export const revalidate = 60; // revalidate every 60 seconds

export default async function HomePage() {
  // Fetch published articles from Supabase
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("articles")
    .select("*, author:profiles!articles_author_id_fkey(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles: Article[] = data || [];
  const featuredArticle = articles.find((a) => a.is_featured) || articles[0] || null;

  return (
    <>
      <SplashGate />
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection headlines={tickerHeadlines} />
        {featuredArticle && <SpotlightSection article={featuredArticle} />}
        <TableOfContents entries={sampleTocEntries} />
        <WhoIsWho personnel={samplePersonnel} />
        {articles.length > 0 && <ArticlesGrid articles={articles} />}
        <PhotoGallery items={sampleGalleryItems} />

        <MastheadStrip />
        <CampusMap locations={sampleCampusLocations} />
        <Footer />
        <MagazineTrigger
          articles={articles}
          personnel={samplePersonnel}
          tocEntries={sampleTocEntries}
          galleryItems={sampleGalleryItems}
          campusLocations={sampleCampusLocations}
        />
      </main>
    </>
  );
}
