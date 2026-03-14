"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RevealText, RevealLine } from "@/components/ui/RevealText";

interface MediaItem {
  id: string;
  title: string;
  type: "image" | "video";
  thumbnail?: string;
}

const sampleMedia: MediaItem[] = [
  { id: "m1", title: "Tech Fest Opening Ceremony", type: "image" },
  { id: "m2", title: "Cricket Finals Highlights", type: "video" },
  { id: "m3", title: "Cultural Night Performances", type: "image" },
  { id: "m4", title: "Lab Inauguration", type: "image" },
  { id: "m5", title: "Student Panel Discussion", type: "video" },
  { id: "m6", title: "Campus Drone View", type: "image" },
];

export default function MediaVault() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundaries to show/hide arrows
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 304; // ~w-72 (288) + gap (16)
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  };

  return (
    <section id="media" className="bg-surface py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section title + arrow controls */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-2">
              <RevealText>// MEDIA VAULT</RevealText>
            </h2>
            <RevealLine delay={0.2} />
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="group relative p-2.5 border border-border-subtle rounded-lg transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:border-gold/60 hover:bg-gold/5 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft
                size={18}
                className="text-muted group-hover:text-gold transition-colors"
              />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="group relative p-2.5 border border-border-subtle rounded-lg transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:border-gold/60 hover:bg-gold/5 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight
                size={18}
                className="text-muted group-hover:text-gold transition-colors"
              />
            </button>
          </div>
        </div>

        {/* Carousel container with hidden scrollbar */}
        <div className="relative group/carousel">
          {/* Left gradient fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
          )}

          {/* Right gradient fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            className="hide-scrollbar overflow-x-auto pb-4 -mx-4 px-4"
          >
            <div
              className="flex gap-4"
              style={{ minWidth: "max-content" }}
            >
              {sampleMedia.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedItem(item)}
                  className="group relative w-64 sm:w-72 shrink-0 rounded-lg overflow-hidden border border-border-subtle hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5"
                >
                  {/* Thumbnail placeholder */}
                  <div className="aspect-video bg-surface-light relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.type === "video" ? (
                        <div className="w-12 h-12 rounded-full bg-red-accent/80 flex items-center justify-center group-hover:bg-red-accent group-hover:scale-110 transition-all duration-300">
                          <Play size={20} className="text-white ml-0.5" />
                        </div>
                      ) : (
                        <ImageIcon
                          size={24}
                          className="text-muted/50 group-hover:text-gold/50 transition-colors"
                        />
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="font-mono text-xs text-foreground">
                        {item.title}
                      </span>
                      <div className="font-mono text-[10px] text-muted mt-1">
                        {item.type === "video" ? "VIDEO" : "PHOTO"}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl w-full bg-surface border border-border-subtle rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 text-muted hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>

              <div className="aspect-video bg-surface-light flex items-center justify-center">
                {selectedItem.type === "video" ? (
                  <div className="text-center">
                    <Play size={48} className="text-gold mx-auto mb-3" />
                    <p className="font-mono text-sm text-muted">
                      Video player placeholder
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon
                      size={48}
                      className="text-gold mx-auto mb-3"
                    />
                    <p className="font-mono text-sm text-muted">
                      Full-resolution image
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border-subtle">
                <h3 className="font-serif text-lg">{selectedItem.title}</h3>
                <span className="font-mono text-[10px] text-muted">
                  {selectedItem.type.toUpperCase()} &middot; GHORPAD MEDIA
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
