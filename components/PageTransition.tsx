"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with smooth entrance/exit animations.
 * Uses pathname as key so each route change triggers a fresh animation.
 *
 * Layered approach:
 *  1. A quick overlay wipe slides across the screen
 *  2. The new page content fades + slides in behind it
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayedPath, setDisplayedPath] = useState(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render (handled by initial page load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayedPath(pathname);
      return;
    }

    // Start transition
    setDisplayedPath(pathname);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={displayedPath}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {/* Page wipe overlay — a gold line sweeps across on route change */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.05 }}
          className="fixed inset-0 z-[100] bg-gold origin-right pointer-events-none"
          style={{ transformOrigin: "right" }}
        />

        {/* Page content with slide-up entrance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            delay: 0.15,
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
