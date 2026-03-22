"use client";

import { useState, useEffect } from "react";
import { X, Camera, Play } from "lucide-react";
import { SectionHeading, RevealOnScroll } from "@/components/ui/RevealText";
import type { GalleryItem, GalleryCategory } from "@/types";

const ALL_CATEGORIES: GalleryCategory[] = [
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

interface PhotoGalleryProps {
  items: GalleryItem[];
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "All">(
    "All"
  );
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Listen for TOC "gallery-filter" events to auto-select a category
  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent).detail as GalleryCategory;
      if (ALL_CATEGORIES.includes(cat)) {
        setActiveCategory(cat);
      }
    };
    window.addEventListener("gallery-filter", handler);
    return () => window.removeEventListener("gallery-filter", handler);
  }, []);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const getAspectClass = (ratio: string) => {
    switch (ratio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-video";
      case "square":
        return "aspect-square";
      default:
        return "aspect-square";
    }
  };

  return (
    <section id="gallery" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading label="// PHOTO GALLERY" title="Through the Lens" />

        {/* Category Filter */}
        <RevealOnScroll>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveCategory("All")}
              className={`font-mono text-[10px] tracking-widest px-3 py-1.5 rounded transition-all ${
                activeCategory === "All"
                  ? "bg-gold text-background"
                  : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
              }`}
            >
              ALL
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-mono text-[10px] tracking-widest px-3 py-1.5 rounded transition-all ${
                  activeCategory === cat
                    ? "bg-gold text-background"
                    : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        {/* Masonry Grid */}
        <div className="masonry-grid">
          {filtered.map((item, i) => (
            <RevealOnScroll key={item.id} delay={i * 0.05}>
              <div
                className="break-inside-avoid mb-4 group cursor-pointer"
                onClick={() => setLightboxItem(item)}
              >
                <div
                  className={`relative ${getAspectClass(
                    item.aspect_ratio
                  )} bg-surface-light rounded-lg overflow-hidden border border-border-subtle hover:border-gold/30 transition-all`}
                >
                  {/* Image or placeholder */}
                  {item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.type === "video" ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center">
                            <Play size={20} className="text-gold ml-0.5" />
                          </div>
                          <span className="font-mono text-[9px] text-muted">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <Camera
                          size={24}
                          className="text-muted/40 group-hover:text-gold/50 transition-colors"
                        />
                      )}
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <h4 className="font-serif text-sm font-semibold text-foreground truncate">
                      {item.title}
                    </h4>
                    <span className="font-mono text-[9px] text-gold">
                      {item.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-mono text-[8px] bg-gold text-background px-1.5 py-0.5 rounded">
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Camera size={32} className="mx-auto text-muted/20 mb-3" />
            <p className="font-mono text-xs text-muted">
              No items in this category.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-surface border border-border-subtle text-muted hover:text-foreground z-10 transition-colors"
          >
            <X size={18} />
          </button>

          <div
            className="w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full flex-1 min-h-0 bg-surface-light rounded-xl overflow-hidden border border-border-subtle mb-4 flex items-center justify-center"
            >
              {lightboxItem.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.title}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {lightboxItem.type === "video" ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gold/30 flex items-center justify-center">
                        <Play size={28} className="text-gold ml-1" />
                      </div>
                      <span className="font-mono text-xs text-muted">
                        VIDEO PREVIEW
                      </span>
                    </div>
                  ) : (
                    <Camera size={40} className="text-muted/20" />
                  )}
                </div>
              )}
            </div>

            <div className="text-center">
              <h3 className="font-serif text-xl font-bold mb-1">
                {lightboxItem.title}
              </h3>
              <span className="font-mono text-[10px] text-gold">
                {lightboxItem.category.toUpperCase()}
              </span>
              {lightboxItem.description && (
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  {lightboxItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
