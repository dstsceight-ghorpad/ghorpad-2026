"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { X } from "lucide-react";
import Link from "next/link";
import AnimatedLogo from "./AnimatedLogo";
import MagneticButton from "@/components/ui/MagneticButton";

interface HeroSectionProps {
  headlines: string[];
}

export default function HeroSection({ headlines }: HeroSectionProps) {
  const [engineReady, setEngineReady] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Multi-layer parallax transforms (different speeds for depth)
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const particlesY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const ctaY = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.4, 0.85]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  const particleOptions = useMemo(
    () => ({
      fullScreen: false as const,
      fpsLimit: 60,
      particles: {
        color: { value: "#e8c84a" },
        number: { value: 60, density: { enable: true } },
        opacity: { value: 0.12 },
        size: { value: { min: 1, max: 2 } },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none" as const,
          outModes: { default: "bounce" as const },
        },
        links: {
          enable: true,
          distance: 120,
          color: "#e8c84a",
          opacity: 0.06,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" as const },
        },
        modes: {
          repulse: { distance: 100, speed: 0.5 },
        },
      },
    }),
    []
  );

  const doubledHeadlines = [...headlines, ...headlines];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-background"
    >
      {/* ── Layer 0: Video background with parallax ──────────── */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 z-0"
      >
        {/* Actual drone video — place hero-drone.mp4 in /public/videos/ */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${
            videoLoaded ? "opacity-25" : "opacity-0"
          }`}
        >
          <source src="/videos/hero-drone.mp4" type="video/mp4" />
          <source src="/videos/hero-drone.webm" type="video/webm" />
        </video>

        {/* Ambient animated gradient fallback (always visible, fades when video loads) */}
        <div
          className={`absolute inset-0 transition-opacity duration-[2000ms] ${
            videoLoaded ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="absolute inset-0 hero-ambient" />
        </div>
      </motion.div>

      {/* ── Layer 1: Cinematic gradient overlays ─────────────── */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 z-[1] bg-background"
      />
      {/* Radial vignette */}
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
      {/* Top-down fade */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-background/60 via-transparent to-background/80" />

      {/* ── Layer 2: Particles with slower parallax ──────────── */}
      <motion.div
        style={{ y: particlesY }}
        className="absolute inset-0 z-[3]"
      >
        {engineReady && (
          <Particles
            id="hero-particles"
            options={particleOptions}
            className="w-full h-full"
          />
        )}
      </motion.div>

      {/* ── Layer 3: Content with staggered parallax ─────────── */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Animated Institute Logo — fastest parallax (closest to camera) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          style={{ y: logoY, scale: logoScale }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            {/* Glow behind logo */}
            <div className="absolute inset-0 blur-3xl bg-gold/15 rounded-full scale-150" />
            <AnimatedLogo size={220} className="relative" />
          </div>
        </motion.div>

        {/* Headline — medium parallax */}
        <motion.div style={{ y: headlineY }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            WHERE CAMPUS SPEAKS
            <br />
            <span className="text-gold">TO THE WORLD</span>
          </motion.h1>
        </motion.div>

        {/* Subtitle — slower parallax */}
        <motion.div style={{ y: subtitleY }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-mono text-xs sm:text-sm text-muted tracking-widest mb-10"
          >
            // MILIT &middot; DSTSC-08
          </motion.p>
        </motion.div>

        {/* CTA buttons — slowest parallax (farthest from camera) */}
        <motion.div style={{ y: ctaY }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton as="div" strength={8}>
              <Link
                href="/#articles"
                className="block bg-gold text-background font-mono text-sm font-semibold px-8 py-3 rounded hover:bg-gold/90 transition-colors"
              >
                EXPLORE LATEST ISSUE
              </Link>
            </MagneticButton>
            <MagneticButton as="div" strength={8}>
              <button
                onClick={() => setShowTeam(true)}
                className="block border border-foreground/30 text-foreground font-mono text-sm px-8 py-3 rounded hover:border-gold hover:text-gold transition-colors"
              >
                MEET THE TEAM
              </button>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Layer 4: Scroll indicator ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] text-muted tracking-widest">
            SCROLL
          </span>
          <div className="w-5 h-8 border border-muted/50 rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1 h-1.5 bg-gold rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Meet the Team Popup ──────────────────────────────── */}
      <AnimatePresence>
        {showTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTeam(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTeam(false)}
                className="absolute -top-4 -right-4 sm:top-2 sm:right-2 z-10 p-2 rounded-full bg-surface border border-border-subtle text-muted hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
              <div className="rounded-xl overflow-hidden border border-gold/30 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/team-photo.jpg"
                  alt="Ghorpad 2026 Editorial Team"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center mt-4 font-mono text-xs tracking-widest text-gold">
                GHORPAD 2026 &middot; EDITORIAL TEAM
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layer 5: Live Ticker ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-border-subtle bg-surface/80 backdrop-blur-sm"
      >
        <div className="flex items-center">
          <div className="bg-red-accent px-3 py-2.5 font-mono text-xs font-bold text-white shrink-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white live-pulse" />
            BREAKING
          </div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-animate flex whitespace-nowrap py-2.5">
              {doubledHeadlines.map((headline, i) => (
                <span
                  key={i}
                  className="font-mono text-xs text-muted mx-8 inline-block"
                >
                  {headline}
                  <span className="text-gold ml-8">&bull;</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
