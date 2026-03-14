"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── RevealText ──────────────────────────────────────────────
// Animates text by revealing it word-by-word or character-by-character
// when it scrolls into view.

interface RevealTextProps {
  children: string;
  /** "word" splits on spaces; "char" splits every character */
  by?: "word" | "char";
  /** Tailwind classes applied to the wrapper span */
  className?: string;
  /** Delay before the first item starts animating (seconds) */
  delay?: number;
  /** Time between each item animation (seconds) */
  stagger?: number;
  /** Once animated, don't re-animate */
  once?: boolean;
}

export function RevealText({
  children,
  by = "word",
  className = "",
  delay = 0,
  stagger = 0.04,
  once = true,
}: RevealTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });

  const items = by === "word" ? children.split(" ") : children.split("");
  const separator = by === "word" ? "\u00A0" : ""; // non-breaking space for words

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={
              inView
                ? { y: "0%", opacity: 1 }
                : { y: "110%", opacity: 0 }
            }
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              delay: delay + i * stagger,
            }}
          >
            {item}
            {separator}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── RevealLine ──────────────────────────────────────────────
// A horizontal line that sweeps in from left when scrolled into view.

interface RevealLineProps {
  className?: string;
  delay?: number;
  color?: string;
}

export function RevealLine({
  className = "w-12 h-0.5 bg-gold",
  delay = 0.3,
  color,
}: RevealLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        className={className}
        initial={{ scaleX: 0, originX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          delay,
        }}
        style={color ? { backgroundColor: color } : undefined}
      />
    </div>
  );
}

// ─── RevealOnScroll ──────────────────────────────────────────
// A wrapper that fades + slides children in when scrolled into view.

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  /** Distance in pixels for the slide */
  distance?: number;
  once?: boolean;
}

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 30,
  once = true,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });

  const dirMap = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const offset = dirMap[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── SectionHeading ─────────────────────────────────────────
// Combines RevealText + RevealLine for a consistent section header pattern.
// This is the main export most sections will use.

interface SectionHeadingProps {
  /** The monospace label, e.g. "// LATEST DISPATCHES" */
  label: string;
  /** Optional serif title beneath the label */
  title?: string;
  /** Optional delay before animations begin */
  delay?: number;
  /** Optional extra className on the wrapper */
  className?: string;
}

export function SectionHeading({
  label,
  title,
  delay = 0,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-2">
        <RevealText delay={delay} stagger={0.03}>
          {label}
        </RevealText>
      </h2>
      <RevealLine delay={delay + 0.2} />
      {title && (
        <p className="font-serif text-3xl sm:text-4xl font-bold mt-4">
          <RevealText delay={delay + 0.35} stagger={0.05} by="word">
            {title}
          </RevealText>
        </p>
      )}
    </div>
  );
}
