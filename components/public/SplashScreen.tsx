"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";

// Deterministic pseudo-random based on seed
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export default function SplashScreen() {
  const [dismissing, setDismissing] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [logoSize, setLogoSize] = useState(400);
  const [showHint, setShowHint] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-compute particle positions deterministically
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        w: 1 + seededRandom(i * 3) * 2,
        h: 1 + seededRandom(i * 3 + 1) * 2,
        left: seededRandom(i * 7 + 2) * 100,
        top: seededRandom(i * 7 + 3) * 100,
        opacity: 0.05 + seededRandom(i * 7 + 4) * 0.1,
        duration: 3 + seededRandom(i * 7 + 5) * 4,
        delay: seededRandom(i * 7 + 6) * 3,
      })),
    []
  );

  // Calculate logo size based on viewport — leave room for text below
  useEffect(() => {
    function updateSize() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Logo should leave ~250px for text below + some top margin
      const maxFromHeight = vh - 300;
      const maxFromWidth = vw * 0.6;
      setLogoSize(Math.max(220, Math.min(maxFromHeight, maxFromWidth, 500)));
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Show "click to enter" hint after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    if (dismissing) return;
    setDismissing(true);
    // After CSS transition completes, remove from DOM
    setTimeout(() => setRemoved(true), 900);
  }, [dismissing]);

  // Also allow keyboard dismiss
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        handleDismiss();
      }
    }
    if (!removed) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [removed, handleDismiss]);

  if (removed) return null;

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{
        backgroundColor: "#060604",
        opacity: dismissing ? 0 : 1,
        transition: "opacity 0.8s ease-in-out",
        pointerEvents: dismissing ? "none" : "auto",
      }}
      role="button"
      tabIndex={0}
      aria-label="Click to enter the website"
    >
          {/* Radial glow behind logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute"
            style={{
              width: logoSize * 1.8,
              height: logoSize * 1.8,
              background:
                "radial-gradient(circle, rgba(232,200,74,0.06) 0%, rgba(232,200,74,0.02) 40%, transparent 70%)",
              borderRadius: "50%",
            }}
          />

          {/* Subtle particle dots in background (client-only to avoid hydration mismatch) */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: p.w,
                    height: p.h,
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    backgroundColor: `rgba(232,200,74,${p.opacity})`,
                  }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <AnimatedLogo size={logoSize} />
          </motion.div>

          {/* DSTSC-08 course name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative z-10 text-center mt-5"
          >
            <h1
              className="font-serif font-bold tracking-wide"
              style={{
                fontSize: `clamp(22px, ${logoSize * 0.07}px, 42px)`,
                color: "rgba(232,200,74,0.9)",
                textShadow: "0 0 30px rgba(232,200,74,0.2)",
                letterSpacing: "0.18em",
              }}
            >
              DSTSC-08
            </h1>
            <p
              className="font-mono tracking-[0.4em] mt-2"
              style={{
                fontSize: `clamp(10px, ${logoSize * 0.025}px, 14px)`,
                color: "rgba(136,136,136,0.5)",
              }}
            >
              PRESENTS
            </p>
          </motion.div>

          {/* GHORPAD magazine name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="relative z-10 text-center mt-4"
          >
            <h2
              className="font-serif font-bold"
              style={{
                fontSize: `clamp(28px, ${logoSize * 0.1}px, 56px)`,
                color: "rgba(240,240,240,0.9)",
                letterSpacing: "0.12em",
              }}
            >
              GHORPAD
            </h2>
            <p
              className="font-mono tracking-[0.3em] mt-1"
              style={{
                fontSize: `clamp(10px, ${logoSize * 0.028}px, 14px)`,
                color: "rgba(232,200,74,0.5)",
              }}
            >
              2025-26
            </p>
          </motion.div>

          {/* "Click to enter" hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showHint ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-10 left-0 right-0 text-center z-10"
          >
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="font-mono text-xs tracking-[0.3em]"
              style={{ color: "rgba(136,136,136,0.5)" }}
            >
              CLICK ANYWHERE TO ENTER
            </motion.p>
            {/* Animated down chevron */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-2 flex justify-center"
            >
              <svg
                width="20"
                height="12"
                viewBox="0 0 20 12"
                fill="none"
                style={{ opacity: 0.3 }}
              >
                <path
                  d="M1 1L10 10L19 1"
                  stroke="rgba(232,200,74,0.5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Corner decorations */}
          <div
            className="absolute top-6 left-6 w-8 h-8 border-t border-l"
            style={{ borderColor: "rgba(232,200,74,0.15)" }}
          />
          <div
            className="absolute top-6 right-6 w-8 h-8 border-t border-r"
            style={{ borderColor: "rgba(232,200,74,0.15)" }}
          />
          <div
            className="absolute bottom-6 left-6 w-8 h-8 border-b border-l"
            style={{ borderColor: "rgba(232,200,74,0.15)" }}
          />
          <div
            className="absolute bottom-6 right-6 w-8 h-8 border-b border-r"
            style={{ borderColor: "rgba(232,200,74,0.15)" }}
          />
    </div>
  );
}
