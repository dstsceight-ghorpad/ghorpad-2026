"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Custom cursor — monitor lizard (ghorpad) silhouette.
 * - Vertical lizard follows cursor with zero lag (direct transform)
 * - Tongue flicks out on every click
 * - Hidden on touch devices
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);
  const isTouchDevice = useRef(false);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  const updatePosition = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -40%)`;
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
        width="32"
        height="40"
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
      >
        {/* Lizard body — vertical, head at top */}

        {/* Tongue — flicks out on click */}
        <g
          style={{
            opacity: clicking ? 1 : 0,
            transition: "opacity 0.05s ease",
          }}
        >
          {/* Forked tongue */}
          <line x1="16" y1="2" x2="16" y2="-4" stroke="#cc2222" strokeWidth="1" strokeLinecap="round" />
          <line x1="16" y1="-4" x2="14.5" y2="-7" stroke="#cc2222" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="16" y1="-4" x2="17.5" y2="-7" stroke="#cc2222" strokeWidth="0.8" strokeLinecap="round" />
        </g>

        {/* Head */}
        <ellipse cx="16" cy="6" rx="4.5" ry="5" fill="#c5a030" />
        {/* Eyes */}
        <circle cx="13.5" cy="5" r="1.2" fill="#1a1a1a" />
        <circle cx="18.5" cy="5" r="1.2" fill="#1a1a1a" />
        <circle cx="13.8" cy="4.7" r="0.4" fill="#ffffff" />
        <circle cx="18.8" cy="4.7" r="0.4" fill="#ffffff" />
        {/* Snout */}
        <ellipse cx="16" cy="3" rx="2.5" ry="2" fill="#b89428" />

        {/* Neck */}
        <rect x="13" y="10" width="6" height="3" rx="1" fill="#b89428" />

        {/* Body */}
        <ellipse cx="16" cy="19" rx="6" ry="8" fill="#c5a030" />
        {/* Body texture — scale pattern */}
        <ellipse cx="16" cy="16" rx="4" ry="2" fill="#b89428" opacity="0.5" />
        <ellipse cx="16" cy="20" rx="4.5" ry="2" fill="#b89428" opacity="0.4" />
        <ellipse cx="16" cy="24" rx="3.5" ry="1.5" fill="#b89428" opacity="0.3" />

        {/* Front left leg */}
        <path d="M11 14 L6 11 L4 13" stroke="#b89428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Front left toes */}
        <circle cx="3.5" cy="12" r="0.6" fill="#a08520" />
        <circle cx="3" cy="13.5" r="0.6" fill="#a08520" />

        {/* Front right leg */}
        <path d="M21 14 L26 11 L28 13" stroke="#b89428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Front right toes */}
        <circle cx="28.5" cy="12" r="0.6" fill="#a08520" />
        <circle cx="29" cy="13.5" r="0.6" fill="#a08520" />

        {/* Back left leg */}
        <path d="M11 24 L6 27 L4 25" stroke="#b89428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="3.5" cy="24" r="0.6" fill="#a08520" />
        <circle cx="3" cy="25.5" r="0.6" fill="#a08520" />

        {/* Back right leg */}
        <path d="M21 24 L26 27 L28 25" stroke="#b89428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="28.5" cy="24" r="0.6" fill="#a08520" />
        <circle cx="29" cy="25.5" r="0.6" fill="#a08520" />

        {/* Tail — long, tapering downward */}
        <path
          d="M16 27 Q14 32 15 35 Q16 38 16.5 40"
          stroke="#b89428"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M16.5 40 Q17 42 16.8 44"
          stroke="#a08520"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
