"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";

// Deterministic pseudo-random based on seed
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export default function InaugurationCeremony({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState(0); // 0-5 animation phases
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [logoSize, setLogoSize] = useState(350);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-compute particle positions
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        w: 1 + seededRandom(i * 3) * 3,
        h: 1 + seededRandom(i * 3 + 1) * 3,
        left: seededRandom(i * 7 + 2) * 100,
        top: seededRandom(i * 7 + 3) * 100,
        opacity: 0.05 + seededRandom(i * 7 + 4) * 0.15,
        duration: 2 + seededRandom(i * 7 + 5) * 3,
        delay: seededRandom(i * 7 + 6) * 2,
      })),
    []
  );

  // Responsive logo size
  useEffect(() => {
    function updateSize() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const maxFromHeight = vh - 400;
      const maxFromWidth = vw * 0.5;
      setLogoSize(Math.max(180, Math.min(maxFromHeight, maxFromWidth, 400)));
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Phase progression timer
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),    // Ambience
      setTimeout(() => setPhase(2), 2000),   // Logo
      setTimeout(() => setPhase(3), 4000),   // Title
      setTimeout(() => setPhase(4), 7000),   // Inaugurator
      setTimeout(() => setPhase(5), 10000),  // CTA
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleUnveil = useCallback(() => {
    if (curtainOpen) return;
    setCurtainOpen(true);
    setTimeout(() => {
      setRemoved(true);
      onComplete();
    }, 1400);
  }, [curtainOpen, onComplete]);

  // Keyboard dismiss
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (phase >= 5 && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        handleUnveil();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, handleUnveil]);

  if (removed) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] overflow-hidden select-none"
        style={{ backgroundColor: "#060604" }}
      >
        {/* ── Curtain Panels (background layer — split to reveal website) ── */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 curtain-texture z-[101]"
          style={{
            backgroundColor: "#0a0908",
            borderRight: "1px solid rgba(232,200,74,0.1)",
          }}
          animate={{
            x: curtainOpen ? "-100%" : "0%",
          }}
          transition={{
            duration: 1.2,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2 curtain-texture z-[101]"
          style={{
            backgroundColor: "#0a0908",
            borderLeft: "1px solid rgba(232,200,74,0.1)",
          }}
          animate={{
            x: curtainOpen ? "100%" : "0%",
          }}
          transition={{
            duration: 1.2,
            ease: [0.76, 0, 0.24, 1],
          }}
        />

        {/* ── Golden flash at seam on open ── */}
        {curtainOpen && (
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-[103]"
            style={{ width: 4, backgroundColor: "rgba(232,200,74,0.8)" }}
            initial={{ opacity: 1, scaleY: 1 }}
            animate={{ opacity: 0, scaleX: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}

        {/* ── Content Layer (on top of curtains, fades out when unveiled) ── */}
        <motion.div
          className="absolute inset-0 z-[102] flex flex-col items-center justify-center"
          animate={{ opacity: curtainOpen ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Radial glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              scale: phase >= 1 ? 1 : 0.5,
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute"
            style={{
              width: logoSize * 2.5,
              height: logoSize * 2.5,
              background:
                "radial-gradient(circle, rgba(232,200,74,0.08) 0%, rgba(232,200,74,0.03) 30%, transparent 60%)",
              borderRadius: "50%",
            }}
          />

          {/* Particles */}
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
                    opacity: [0.1, 0.7, 0.1],
                    scale: [1, 1.8, 1],
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

          {/* ── Phase 2: Institute Logo ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: phase >= 2 ? 1 : 0,
              scale: phase >= 2 ? 1 : 0.3,
            }}
            transition={{
              duration: 1.5,
              type: "spring",
              stiffness: 80,
              damping: 15,
            }}
            className="relative z-10"
          >
            {/* Golden halo ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                width: logoSize * 1.4,
                height: logoSize * 1.4,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                border: "1px solid rgba(232,200,74,0.15)",
                boxShadow: "0 0 60px rgba(232,200,74,0.05), inset 0 0 60px rgba(232,200,74,0.03)",
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: phase >= 2 ? 1 : 0.6,
                opacity: phase >= 2 ? 1 : 0,
              }}
              transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
            />
            <AnimatedLogo size={logoSize} />
          </motion.div>

          {/* ── Phase 3: Titles ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: phase >= 3 ? 1 : 0,
              y: phase >= 3 ? 0 : 30,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center mt-6"
          >
            <h1
              className="font-serif font-bold tracking-[0.2em]"
              style={{
                fontSize: `clamp(20px, ${logoSize * 0.065}px, 38px)`,
                color: "rgba(232,200,74,0.9)",
                textShadow: "0 0 40px rgba(232,200,74,0.3)",
              }}
            >
              {"DSTSC-08".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: phase >= 3 ? 1 : 0,
                    y: phase >= 3 ? 0 : 10,
                  }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="font-mono tracking-[0.5em] mt-2"
              style={{
                fontSize: `clamp(9px, ${logoSize * 0.022}px, 13px)`,
                color: "rgba(136,136,136,0.6)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              PRESENTS
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: phase >= 3 ? 1 : 0,
              scale: phase >= 3 ? 1 : 0.8,
            }}
            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
            className="relative z-10 text-center mt-3"
          >
            <h2
              className="font-serif font-bold"
              style={{
                fontSize: `clamp(32px, ${logoSize * 0.12}px, 64px)`,
                color: "rgba(240,240,240,0.95)",
                letterSpacing: "0.15em",
                textShadow:
                  "0 0 60px rgba(232,200,74,0.2), 0 0 120px rgba(232,200,74,0.1)",
              }}
            >
              GHORPAD
            </h2>
            <motion.p
              className="font-mono tracking-[0.3em] mt-1"
              style={{
                fontSize: `clamp(10px, ${logoSize * 0.025}px, 14px)`,
                color: "rgba(232,200,74,0.5)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              THE COURSE MAGAZINE &bull; 2025-26
            </motion.p>
          </motion.div>

          {/* ── Phase 4: Inaugurator ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 4 ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center mt-8"
          >
            {/* Gold divider line */}
            <motion.div
              className="mx-auto mb-5"
              style={{
                height: 1,
                backgroundColor: "rgba(232,200,74,0.3)",
              }}
              initial={{ width: 0 }}
              animate={{ width: phase >= 4 ? 200 : 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />

            <motion.p
              className="font-mono tracking-[0.4em] mb-3"
              style={{
                fontSize: `clamp(9px, ${logoSize * 0.02}px, 12px)`,
                color: "rgba(136,136,136,0.5)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: phase >= 4 ? 1 : 0,
                y: phase >= 4 ? 0 : 10,
              }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              INAUGURATED BY
            </motion.p>

            <motion.h3
              className="font-serif font-bold inaug-shimmer"
              style={{
                fontSize: `clamp(22px, ${logoSize * 0.065}px, 36px)`,
                letterSpacing: "0.08em",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: phase >= 4 ? 1 : 0,
                scale: phase >= 4 ? 1 : 0.9,
              }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              R Adm V Ganapathy, NM
            </motion.h3>

            <motion.p
              className="font-mono tracking-[0.3em] mt-2"
              style={{
                fontSize: `clamp(10px, ${logoSize * 0.025}px, 13px)`,
                color: "rgba(136,136,136,0.5)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 4 ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              COMMANDANT, MILIT
            </motion.p>
          </motion.div>

          {/* ── Phase 5: CTA Button ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase >= 5 ? 1 : 0,
              y: phase >= 5 ? 0 : 20,
            }}
            transition={{ duration: 0.8 }}
            className="relative z-10 mt-10"
          >
            <motion.button
              onClick={handleUnveil}
              className="relative px-10 py-4 font-mono text-sm font-semibold tracking-[0.3em] rounded-lg border overflow-hidden"
              style={{
                color: "#e8c84a",
                borderColor: "rgba(232,200,74,0.4)",
                backgroundColor: "rgba(232,200,74,0.05)",
              }}
              whileHover={{
                backgroundColor: "rgba(232,200,74,0.15)",
                borderColor: "rgba(232,200,74,0.7)",
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(232,200,74,0.1)",
                  "0 0 40px rgba(232,200,74,0.2)",
                  "0 0 20px rgba(232,200,74,0.1)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              UNVEIL THE MAGAZINE
            </motion.button>
          </motion.div>

          {/* Corner decorations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2"
              style={{ borderColor: "rgba(232,200,74,0.2)" }}
            />
            <div
              className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2"
              style={{ borderColor: "rgba(232,200,74,0.2)" }}
            />
            <div
              className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2"
              style={{ borderColor: "rgba(232,200,74,0.2)" }}
            />
            <div
              className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2"
              style={{ borderColor: "rgba(232,200,74,0.2)" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
