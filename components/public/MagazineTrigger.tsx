"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import dynamic from "next/dynamic";
import type { Article, Personnel, TocEntry, Alumni, GalleryItem, CampusLocation } from "@/types";

const MagazineReader = dynamic(() => import("./MagazineReader"), {
  ssr: false,
});

interface MagazineTriggerProps {
  articles: Article[];
  personnel: Personnel[];
  tocEntries: TocEntry[];
  alumni: Alumni[];
  galleryItems: GalleryItem[];
  campusLocations: CampusLocation[];
}

export default function MagazineTrigger({
  articles,
  personnel,
  tocEntries,
  alumni,
  galleryItems,
  campusLocations,
}: MagazineTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-gold/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Read Magazine"
        >
          <BookOpen size={16} />
          <span className="hidden sm:inline">READ MAGAZINE</span>
        </button>
      )}

      {/* Magazine Reader Overlay */}
      {isOpen && (
        <MagazineReader
          articles={articles}
          personnel={personnel}
          tocEntries={tocEntries}
          alumni={alumni}
          galleryItems={galleryItems}
          campusLocations={campusLocations}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
