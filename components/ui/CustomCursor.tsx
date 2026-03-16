"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/components/ThemeProvider";

/**
 * Custom cursor — horizontal monitor lizard (ghorpad) crawling right.
 * - Head points right (toward movement direction)
 * - Tongue flicks out on click
 * - Tail wiggles continuously
 * - Dark theme: natural earthy brown/olive
 * - Light theme: contrasting dark charcoal/slate
 * - Hidden on touch devices
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);
  const isTouchDevice = useRef(false);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const { theme } = useTheme();

  // Color palettes
  const isDark = theme === "dark";
  const colors = isDark
    ? { body: "#6b7a3a", bodyDark: "#556230", belly: "#8a9a50", toes: "#4a5528", eyes: "#1a1a1a", eyeShine: "#ffffff" }
    : { body: "#3a3f4a", bodyDark: "#2d313a", belly: "#505660", toes: "#22252c", eyes: "#ffffff", eyeShine: "#3a3f4a" };

  const updatePosition = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-30%, -50%)`;
    }
    rafRef.current = requestAnimationFrame(updatePosition);
  }, []);

  useEffect(() => {
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleDown = () => setClicking(true);
    const handleUp = () => setClicking(false);
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    rafRef.current = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, updatePosition]);

  if (typeof window === "undefined") return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
        willChange: "transform",
      }}
    >
      <svg
        width="56"
        height="32"
        viewBox="-14 0 58 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: isDark ? "drop-shadow(0 1px 3px rgba(0,0,0,0.6))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
      >
        {/* Horizontal lizard — head pointing RIGHT, tail to LEFT */}

        {/* Tongue — flicks out on click (extends right from head) */}
        <g
          style={{
            opacity: clicking ? 1 : 0,
            transition: "opacity 0.05s ease",
          }}
        >
          <line x1="30" y1="16" x2="40" y2="16" stroke="#dd2222" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="40" y1="16" x2="45" y2="13" stroke="#dd2222" strokeWidth="1" strokeLinecap="round" />
          <line x1="40" y1="16" x2="45" y2="19" stroke="#dd2222" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Head — right side */}
        <ellipse cx="26" cy="16" rx="5" ry="4.5" fill={colors.body} />
        {/* Snout */}
        <ellipse cx="29" cy="16" rx="2" ry="2.5" fill={colors.bodyDark} />
        {/* Eyes */}
        <circle cx="27" cy="13.5" r="1.2" fill={colors.eyes} />
        <circle cx="27" cy="18.5" r="1.2" fill={colors.eyes} />
        <circle cx="27.3" cy="13.8" r="0.4" fill={colors.eyeShine} />
        <circle cx="27.3" cy="18.8" r="0.4" fill={colors.eyeShine} />

        {/* Neck */}
        <rect x="19" y="13" width="3" height="6" rx="1" fill={colors.bodyDark} />

        {/* Body — central oval */}
        <ellipse cx="13" cy="16" rx="8" ry="6" fill={colors.body} />
        {/* Body texture — scale bands */}
        <ellipse cx="16" cy="16" rx="2" ry="4" fill={colors.bodyDark} opacity="0.5" />
        <ellipse cx="12" cy="16" rx="2" ry="4.5" fill={colors.bodyDark} opacity="0.4" />
        <ellipse cx="8" cy="16" rx="1.5" ry="3.5" fill={colors.bodyDark} opacity="0.3" />

        {/* Front top leg (near head, upward) */}
        <path d="M18 11 L21 6 L19 4" stroke={colors.bodyDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="20" cy="3.5" r="0.6" fill={colors.toes} />
        <circle cx="18.5" cy="3" r="0.6" fill={colors.toes} />

        {/* Front bottom leg (near head, downward) */}
        <path d="M18 21 L21 26 L19 28" stroke={colors.bodyDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="20" cy="28.5" r="0.6" fill={colors.toes} />
        <circle cx="18.5" cy="29" r="0.6" fill={colors.toes} />

        {/* Back top leg (near tail, upward) */}
        <path d="M8 11 L5 6 L7 4" stroke={colors.bodyDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="6" cy="3.5" r="0.6" fill={colors.toes} />
        <circle cx="7.5" cy="3" r="0.6" fill={colors.toes} />

        {/* Back bottom leg (near tail, downward) */}
        <path d="M8 21 L5 26 L7 28" stroke={colors.bodyDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="6" cy="28.5" r="0.6" fill={colors.toes} />
        <circle cx="7.5" cy="29" r="0.6" fill={colors.toes} />

        {/* Tail — extends LEFT with wiggle animation */}
        <g style={{ transformOrigin: "5px 16px" }} className="animate-tail-wiggle">
          <path
            d="M5 16 Q0 14 -3 15 Q-6 16 -8 15.5"
            stroke={colors.bodyDark}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M-8 15.5 Q-10 15 -12 15.8"
            stroke={colors.toes}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
