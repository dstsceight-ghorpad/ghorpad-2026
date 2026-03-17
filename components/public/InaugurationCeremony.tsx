"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";

/* ── Deterministic random ── */
function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/* ══════════════════════════════════════════════════════════════
   Realistic Applause — Web Audio API
   Multiple overlapping noise layers with envelope shaping to
   create the sound of a crowd clapping for ~10 seconds.
   ══════════════════════════════════════════════════════════════ */
function playApplause(durationSec = 10) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const sr = ctx.sampleRate;

    // --- Layer 1: Dense crowd clapping (main body) ---
    const len1 = sr * durationSec;
    const buf1 = ctx.createBuffer(2, len1, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf1.getChannelData(ch);
      for (let i = 0; i < len1; i++) {
        // Irregular bursts simulating many people clapping at different rates
        const t = i / sr;
        const burst1 = Math.sin(t * 47.3) > 0.2 ? 1 : 0.4;
        const burst2 = Math.sin(t * 31.7 + 1.3) > 0.1 ? 1 : 0.5;
        const burst3 = Math.sin(t * 67.1 + 2.7) > 0.3 ? 1 : 0.3;
        const crowd = (burst1 + burst2 + burst3) / 3;
        d[i] = (Math.random() * 2 - 1) * crowd;
      }
    }
    const src1 = ctx.createBufferSource();
    src1.buffer = buf1;

    // Bandpass for clap timbre
    const bp1 = ctx.createBiquadFilter();
    bp1.type = "bandpass";
    bp1.frequency.setValueAtTime(2200, now);
    bp1.Q.setValueAtTime(0.6, now);

    // Highpass remove rumble
    const hp1 = ctx.createBiquadFilter();
    hp1.type = "highpass";
    hp1.frequency.setValueAtTime(600, now);

    const gain1 = ctx.createGain();
    // Envelope: swell in, sustain, fade out
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.5);
    gain1.gain.linearRampToValueAtTime(0.12, now + 1.5);
    gain1.gain.setValueAtTime(0.12, now + durationSec * 0.5);
    gain1.gain.linearRampToValueAtTime(0.10, now + durationSec * 0.7);
    gain1.gain.linearRampToValueAtTime(0.04, now + durationSec * 0.9);
    gain1.gain.linearRampToValueAtTime(0.001, now + durationSec);

    src1.connect(bp1);
    bp1.connect(hp1);
    hp1.connect(gain1);
    gain1.connect(ctx.destination);
    src1.start(now);
    src1.stop(now + durationSec + 0.5);

    // --- Layer 2: Sharper individual claps (texture) ---
    const len2 = sr * durationSec;
    const buf2 = ctx.createBuffer(2, len2, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf2.getChannelData(ch);
      for (let i = 0; i < len2; i++) {
        const t = i / sr;
        // Sporadic sharp transients
        const clap = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 3 : 0;
        const ambient = (Math.random() * 2 - 1) * 0.3;
        const rhythmic = Math.sin(t * 23.5) > 0.7 ? (Math.random() * 2 - 1) : 0;
        d[i] = clap + ambient + rhythmic * 0.5;
      }
    }
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;

    const bp2 = ctx.createBiquadFilter();
    bp2.type = "bandpass";
    bp2.frequency.setValueAtTime(3500, now);
    bp2.Q.setValueAtTime(0.8, now);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.04, now + 0.8);
    gain2.gain.setValueAtTime(0.04, now + durationSec * 0.5);
    gain2.gain.linearRampToValueAtTime(0.001, now + durationSec);

    src2.connect(bp2);
    bp2.connect(gain2);
    gain2.connect(ctx.destination);
    src2.start(now);
    src2.stop(now + durationSec + 0.5);

    // --- Layer 3: Low crowd murmur ---
    const len3 = sr * durationSec;
    const buf3 = ctx.createBuffer(1, len3, sr);
    const d3 = buf3.getChannelData(0);
    for (let i = 0; i < len3; i++) {
      d3[i] = (Math.random() * 2 - 1);
    }
    const src3 = ctx.createBufferSource();
    src3.buffer = buf3;

    const lp3 = ctx.createBiquadFilter();
    lp3.type = "lowpass";
    lp3.frequency.setValueAtTime(400, now);

    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(0.015, now + 1);
    gain3.gain.setValueAtTime(0.015, now + durationSec * 0.6);
    gain3.gain.linearRampToValueAtTime(0.001, now + durationSec);

    src3.connect(lp3);
    lp3.connect(gain3);
    gain3.connect(ctx.destination);
    src3.start(now);
    src3.stop(now + durationSec + 0.5);
  } catch {
    /* Audio not supported — silent */
  }
}

/* ── Confetti piece ── */
function ConfettiPiece({ index, active }: { index: number; active: boolean }) {
  const style = useMemo(() => {
    const colors = [
      "#FFD700", "#DAA520", "#FFA500", "#FF6347",
      "#FFFFFF", "#B8860B", "#FFE4B5", "#FF4500",
    ];
    return {
      left: `${seeded(index * 11) * 100}%`,
      width: 4 + seeded(index * 13) * 8,
      height: 4 + seeded(index * 17) * 8,
      bg: colors[Math.floor(seeded(index * 19) * colors.length)],
      delay: seeded(index * 23) * 3,
      duration: 4 + seeded(index * 29) * 4,
      rotate: seeded(index * 31) * 720,
      swayAmp: 20 + seeded(index * 37) * 40,
    };
  }, [index]);

  if (!active) return null;

  return (
    <motion.div
      className="absolute top-0 rounded-sm"
      style={{
        left: style.left,
        width: style.width,
        height: style.height,
        backgroundColor: style.bg,
        zIndex: 200,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
      animate={{
        y: "110vh",
        opacity: [1, 1, 0.8, 0],
        rotate: style.rotate,
        x: [0, style.swayAmp, -style.swayAmp, style.swayAmp * 0.5, 0],
      }}
      transition={{
        duration: style.duration,
        delay: style.delay,
        ease: "linear",
        x: {
          duration: style.duration,
          ease: "easeInOut",
          repeat: Infinity,
        },
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function InaugurationCeremony({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [logoSize, setLogoSize] = useState(320);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Track wave animation progress for curtain cloth effect
  const [curtainProgress, setCurtainProgress] = useState(0);
  const audioPlayed = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Particles
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        w: 1 + seeded(i * 3) * 3,
        h: 1 + seeded(i * 3 + 1) * 3,
        left: seeded(i * 7 + 2) * 100,
        top: seeded(i * 7 + 3) * 100,
        opacity: 0.05 + seeded(i * 7 + 4) * 0.12,
        duration: 2.5 + seeded(i * 7 + 5) * 3,
        delay: seeded(i * 7 + 6) * 2,
      })),
    []
  );

  // Responsive logo
  useEffect(() => {
    function update() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const maxLogo = Math.min(vh * 0.28, vw * 0.35, 280);
      setLogoSize(Math.max(120, maxLogo));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Phase progression
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => setPhase(4), 6500),
      setTimeout(() => setPhase(5), 9500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  // Animate curtain wave progress when opening
  useEffect(() => {
    if (!curtainOpen) return;
    const startTime = Date.now();
    const totalDuration = 6000; // 6 seconds
    let raf: number;
    function tick() {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / totalDuration, 1);
      setCurtainProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [curtainOpen]);

  const handleUnveil = useCallback(() => {
    if (curtainOpen) return;

    // Play applause only
    if (!audioPlayed.current) {
      audioPlayed.current = true;
      playApplause(10);
    }

    setShowConfetti(true);
    setCurtainOpen(true);

    // Remove overlay after curtains fully open (6s) + brief hold (1s)
    setTimeout(() => {
      setRemoved(true);
      onComplete();
    }, 7500);
  }, [curtainOpen, onComplete]);

  // Keyboard
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

  /* ── Curtain wave easing: slow start, smooth middle, gentle settle ── */
  // Using a custom multi-step easing for cloth-like wave movement
  const curtainEase: [number, number, number, number] = [0.16, 0.9, 0.4, 1];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] overflow-hidden select-none"
        style={{ backgroundColor: "#0c0404" }}
      >
        {/* ═══ STAGE BACKGROUND ═══ */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(60,10,10,0.4) 0%, transparent 60%)",
          }}
        />

        {/* ═══ SPOTLIGHT ═══ */}
        <div className="absolute inset-0 stage-spotlight pointer-events-none" />

        {/* ═══ LEFT CURTAIN ═══ */}
        <motion.div
          className="absolute inset-y-0 left-0 w-[52%] curtain-panel"
          style={{
            borderRight: "2px solid rgba(184,134,11,0.3)",
            transformOrigin: "left center",
          }}
          animate={{
            x: curtainOpen ? "-105%" : "0%",
          }}
          transition={{
            duration: 6,
            ease: curtainEase,
          }}
        >
          {/* Cloth wave ripple effect during opening */}
          <motion.div
            className="absolute inset-0"
            animate={{
              skewX: curtainOpen
                ? [0, 2, -1.5, 1, -0.5, 0]
                : 0,
              scaleX: curtainOpen
                ? [1, 1.03, 0.98, 1.01, 0.995, 1]
                : 1,
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "left center" }}
          >
            {/* Animated fold highlights during movement */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: curtainOpen ? [0, 0.3, 0.15, 0.25, 0] : 0,
              }}
              transition={{ duration: 6 }}
              style={{
                background: "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.04) 15px, transparent 30px, rgba(0,0,0,0.1) 45px, transparent 60px)",
              }}
            />
          </motion.div>

          {/* Inner fold shadow */}
          <div
            className="absolute inset-y-0 right-0 w-16"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.4))",
            }}
          />
          {/* Gold edge trim */}
          <div
            className="absolute inset-y-0 right-0 w-1"
            style={{
              background: "linear-gradient(180deg, #b8860b, #daa520, #b8860b, #8b6914, #daa520, #b8860b)",
            }}
          />
          {/* Gentle wave animation while closed */}
          {!curtainOpen && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                backgroundPosition: ["0% 0%", "100% 0%"],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                background: "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.01) 20px, transparent 40px)",
                backgroundSize: "200% 100%",
              }}
            />
          )}
        </motion.div>

        {/* ═══ RIGHT CURTAIN ═══ */}
        <motion.div
          className="absolute inset-y-0 right-0 w-[52%] curtain-panel"
          style={{
            borderLeft: "2px solid rgba(184,134,11,0.3)",
            transformOrigin: "right center",
          }}
          animate={{
            x: curtainOpen ? "105%" : "0%",
          }}
          transition={{
            duration: 6,
            ease: curtainEase,
          }}
        >
          {/* Cloth wave ripple effect — mirrored */}
          <motion.div
            className="absolute inset-0"
            animate={{
              skewX: curtainOpen
                ? [0, -2, 1.5, -1, 0.5, 0]
                : 0,
              scaleX: curtainOpen
                ? [1, 1.03, 0.98, 1.01, 0.995, 1]
                : 1,
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "right center" }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: curtainOpen ? [0, 0.3, 0.15, 0.25, 0] : 0,
              }}
              transition={{ duration: 6 }}
              style={{
                background: "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.04) 15px, transparent 30px, rgba(0,0,0,0.1) 45px, transparent 60px)",
              }}
            />
          </motion.div>

          {/* Inner fold shadow */}
          <div
            className="absolute inset-y-0 left-0 w-16"
            style={{
              background: "linear-gradient(270deg, transparent, rgba(0,0,0,0.4))",
            }}
          />
          {/* Gold edge trim */}
          <div
            className="absolute inset-y-0 left-0 w-1"
            style={{
              background: "linear-gradient(180deg, #b8860b, #daa520, #b8860b, #8b6914, #daa520, #b8860b)",
            }}
          />
          {/* Gentle wave while closed */}
          {!curtainOpen && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                backgroundPosition: ["100% 0%", "0% 0%"],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                background: "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.01) 20px, transparent 40px)",
                backgroundSize: "200% 100%",
              }}
            />
          )}
        </motion.div>

        {/* ═══ TOP VALANCE ═══ */}
        <div
          className="absolute top-0 left-0 right-0 z-[104]"
          style={{
            height: 6,
            background: "linear-gradient(180deg, #c49b1a 0%, #daa520 50%, #8b6914 100%)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        />

        {/* ═══ GOLDEN SEAM FLASH on open ═══ */}
        {curtainOpen && (
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-[103]"
            style={{ width: 6, backgroundColor: "rgba(255,215,0,0.9)" }}
            initial={{ opacity: 1, scaleY: 1 }}
            animate={{ opacity: 0, scaleX: 40 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}

        {/* ═══ CONFETTI ═══ */}
        {showConfetti && (
          <div className="absolute inset-0 z-[105] pointer-events-none overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
              <ConfettiPiece key={i} index={i} active={showConfetti} />
            ))}
          </div>
        )}

        {/* ═══ CONTENT (on top of curtains) ═══ */}
        <motion.div
          className="absolute inset-0 z-[102] flex flex-col items-center justify-center"
          animate={{ opacity: curtainOpen ? 0 : 1 }}
          transition={{ duration: 1.5, delay: curtainOpen ? 2 : 0 }}
        >
          {/* Ambient glow */}
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
                "radial-gradient(circle, rgba(255,215,0,0.08) 0%, rgba(218,165,32,0.03) 30%, transparent 60%)",
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
                    backgroundColor: `rgba(255,215,0,${p.opacity})`,
                  }}
                  animate={{
                    opacity: [0.1, 0.6, 0.1],
                    scale: [1, 1.6, 1],
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

          {/* ── Phase 2: Logo ── */}
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
            <motion.div
              className="absolute rounded-full"
              style={{
                width: logoSize * 1.4,
                height: logoSize * 1.4,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                border: "1px solid rgba(255,215,0,0.2)",
                boxShadow:
                  "0 0 80px rgba(255,215,0,0.06), inset 0 0 60px rgba(255,215,0,0.03)",
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
            className="relative z-10 text-center mt-2"
          >
            <h1
              className="font-serif font-bold tracking-[0.2em]"
              style={{
                fontSize: `clamp(36px, ${logoSize * 0.12}px, 64px)`,
                color: "rgba(255,215,0,0.9)",
                textShadow: "0 0 40px rgba(255,215,0,0.3)",
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
                fontSize: `clamp(18px, ${logoSize * 0.045}px, 26px)`,
                color: "rgba(200,180,140,0.7)",
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
            className="relative z-10 text-center mt-1"
          >
            <h2
              className="font-serif font-bold"
              style={{
                fontSize: `clamp(52px, ${logoSize * 0.22}px, 100px)`,
                color: "rgba(245,245,245,0.95)",
                letterSpacing: "0.15em",
                textShadow:
                  "0 0 60px rgba(255,215,0,0.2), 0 0 120px rgba(255,215,0,0.1)",
              }}
            >
              GHORPAD
            </h2>
            <motion.p
              className="font-mono tracking-[0.3em] mt-1"
              style={{
                fontSize: `clamp(18px, ${logoSize * 0.05}px, 28px)`,
                color: "rgba(255,215,0,0.6)",
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
            className="relative z-10 text-center mt-4"
          >
            <motion.div
              className="mx-auto mb-2"
              style={{
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)",
              }}
              initial={{ width: 0 }}
              animate={{ width: phase >= 4 ? 240 : 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />

            <motion.p
              className="font-mono tracking-[0.4em] mb-1"
              style={{
                fontSize: `clamp(18px, ${logoSize * 0.045}px, 26px)`,
                color: "rgba(200,180,140,0.7)",
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
                fontSize: `clamp(36px, ${logoSize * 0.12}px, 60px)`,
                letterSpacing: "0.08em",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: phase >= 4 ? 1 : 0,
                scale: phase >= 4 ? 1 : 0.9,
              }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Rear Adm V Ganapathy, NM
            </motion.h3>

            <motion.p
              className="font-mono tracking-[0.3em] mt-2"
              style={{
                fontSize: `clamp(18px, ${logoSize * 0.05}px, 26px)`,
                color: "rgba(200,180,140,0.6)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 4 ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              COMMANDANT, MILIT
            </motion.p>
          </motion.div>

          {/* ── Phase 5: CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase >= 5 ? 1 : 0,
              y: phase >= 5 ? 0 : 20,
            }}
            transition={{ duration: 0.8 }}
            className="relative z-10 mt-5"
          >
            <motion.button
              onClick={handleUnveil}
              className="relative px-14 py-5 font-mono text-xl font-semibold tracking-[0.3em] rounded-lg border overflow-hidden"
              style={{
                color: "#FFD700",
                borderColor: "rgba(255,215,0,0.4)",
                backgroundColor: "rgba(255,215,0,0.06)",
              }}
              whileHover={{
                backgroundColor: "rgba(255,215,0,0.15)",
                borderColor: "rgba(255,215,0,0.7)",
                scale: 1.03,
              }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255,215,0,0.1)",
                  "0 0 50px rgba(255,215,0,0.25)",
                  "0 0 20px rgba(255,215,0,0.1)",
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

            <motion.p
              className="text-center mt-3 font-mono tracking-wider"
              style={{
                fontSize: "14px",
                color: "rgba(200,180,140,0.35)",
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              or press Enter
            </motion.p>
          </motion.div>

          {/* Corner gold brackets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 1.5 }}
          >
            {[
              "top-6 left-6 border-t-2 border-l-2",
              "top-6 right-6 border-t-2 border-r-2",
              "bottom-6 left-6 border-b-2 border-l-2",
              "bottom-6 right-6 border-b-2 border-r-2",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-10 h-10 ${cls}`}
                style={{ borderColor: "rgba(255,215,0,0.2)" }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
