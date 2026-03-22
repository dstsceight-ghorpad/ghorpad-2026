"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ImageIcon, Smile, ChevronDown } from "lucide-react";
import { SectionHeading, RevealOnScroll } from "@/components/ui/RevealText";
import type { GalleryItem } from "@/types";

interface MemesCornerProps {
  items: GalleryItem[];
}

/** Get/set likes in localStorage */
function getLikedMemes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("likedMemes") || "{}");
  } catch {
    return {};
  }
}

function toggleLike(id: string): boolean {
  const liked = getLikedMemes();
  if (liked[id]) {
    delete liked[id];
  } else {
    liked[id] = true;
  }
  localStorage.setItem("likedMemes", JSON.stringify(liked));
  return !!liked[id];
}

const INITIAL_COUNT = 6;

export default function MemesCorner({ items }: MemesCornerProps) {
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLikedMap(getLikedMemes());
  }, []);

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isNowLiked = toggleLike(id);
    setLikedMap((prev) => ({ ...prev, [id]: isNowLiked }));
  };

  const displayedItems = showAll ? items : items.slice(0, INITIAL_COUNT);

  if (items.length === 0) {
    return (
      <section id="memes" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading label="// MEMES CORNER" title="Campus Humor" />
          <RevealOnScroll>
            <div className="text-center py-16 border border-dashed border-border-subtle rounded-xl">
              <Smile size={40} className="mx-auto text-lime-500/30 mb-4" />
              <p className="font-mono text-sm text-muted mb-2">
                No memes yet — be the first!
              </p>
              <a
                href="/submit"
                className="inline-block font-mono text-xs text-lime-400 border border-lime-500/30 px-4 py-2 rounded hover:bg-lime-500/10 transition-all mt-2"
              >
                SUBMIT A MEME
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    );
  }

  return (
    <section id="memes" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading label="// MEMES CORNER" title="Campus Humor" />

        {/* Meme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <RevealOnScroll delay={i * 0.05}>
                  <div
                    className="group cursor-pointer relative bg-surface rounded-xl overflow-hidden border border-border-subtle hover:border-lime-500/40 transition-all"
                    onClick={() => setLightboxItem(item)}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-surface-light">
                      {item.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon
                            size={28}
                            className="text-muted/30 group-hover:text-lime-500/50 transition-colors"
                          />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Smile size={28} className="text-lime-400" />
                      </div>
                    </div>

                    {/* Caption bar */}
                    <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-foreground truncate">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="font-mono text-[9px] text-muted truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Like button */}
                      {mounted && (
                        <button
                          onClick={(e) => handleLike(e, item.id)}
                          className="shrink-0 flex items-center gap-1 group/like"
                          aria-label={likedMap[item.id] ? "Unlike" : "Like"}
                        >
                          <Heart
                            size={14}
                            className={`transition-colors ${
                              likedMap[item.id]
                                ? "fill-red-500 text-red-500"
                                : "text-muted group-hover/like:text-red-400"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More */}
        {items.length > INITIAL_COUNT && !showAll && (
          <RevealOnScroll>
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 font-mono text-xs text-lime-400 border border-lime-500/30 px-5 py-2.5 rounded-lg hover:bg-lime-500/10 transition-all"
              >
                SHOW ALL {items.length} MEMES
                <ChevronDown size={14} />
              </button>
            </div>
          </RevealOnScroll>
        )}

        {/* Submit CTA */}
        <RevealOnScroll>
          <div className="text-center mt-10">
            <a
              href="/submit"
              className="inline-block font-mono text-[10px] tracking-widest text-muted hover:text-lime-400 transition-colors"
            >
              GOT A MEME? SUBMIT YOURS &rarr;
            </a>
          </div>
        </RevealOnScroll>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxItem(null)}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-surface border border-border-subtle text-muted hover:text-foreground z-10 transition-colors"
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-surface rounded-xl overflow-hidden border border-border-subtle">
                {lightboxItem.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lightboxItem.url}
                    alt={lightboxItem.title}
                    className="w-full max-h-[70vh] object-contain bg-black"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-surface-light">
                    <ImageIcon size={48} className="text-muted/20" />
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-serif text-xl font-bold mb-1">
                  {lightboxItem.title}
                </h3>
                {lightboxItem.description && (
                  <p className="text-sm text-muted mt-1 leading-relaxed">
                    {lightboxItem.description}
                  </p>
                )}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="font-mono text-[10px] text-lime-400">
                    MEMES CORNER
                  </span>
                  {mounted && (
                    <button
                      onClick={(e) => handleLike(e, lightboxItem.id)}
                      className="flex items-center gap-1.5 font-mono text-xs"
                    >
                      <Heart
                        size={16}
                        className={`transition-colors ${
                          likedMap[lightboxItem.id]
                            ? "fill-red-500 text-red-500"
                            : "text-muted hover:text-red-400"
                        }`}
                      />
                      <span className="text-muted">
                        {likedMap[lightboxItem.id] ? "Liked" : "Like"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
