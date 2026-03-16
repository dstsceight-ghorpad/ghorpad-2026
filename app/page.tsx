import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import SpotlightSection from "@/components/public/SpotlightSection";
import TableOfContents from "@/components/public/TableOfContents";
import WhoIsWho from "@/components/public/WhoIsWho";
import ArticlesGrid from "@/components/public/ArticlesGrid";
import MediaVault from "@/components/public/MediaVault";
import PhotoGallery from "@/components/public/PhotoGallery";

import MastheadStrip from "@/components/public/MastheadStrip";
import CampusMap from "@/components/public/CampusMap";
import Footer from "@/components/public/Footer";
import MagazineTrigger from "@/components/public/MagazineTrigger";
import SplashScreen from "@/components/public/SplashScreen";
import {
  sampleArticles,
  samplePersonnel,
  sampleTocEntries,

  sampleCampusLocations,
  sampleGalleryItems,
  tickerHeadlines,
} from "@/lib/sample-data";

export default function HomePage() {
  const featuredArticle =
    sampleArticles.find((a) => a.is_featured) || sampleArticles[0];
  const articles = sampleArticles.filter((a) => a.status === "published");

  return (
    <>
      <SplashScreen />
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection headlines={tickerHeadlines} />
        <SpotlightSection article={featuredArticle} />
        <TableOfContents entries={sampleTocEntries} />
        <WhoIsWho personnel={samplePersonnel} />
        <ArticlesGrid articles={articles} />
        <MediaVault />
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
