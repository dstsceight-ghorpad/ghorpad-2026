"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor with smooth following and interactive state changes.
 * - Outer ring (larger, slower follow)
 * - Inner dot (small, faster follow)
 * - Scales up on hover over interactive elements (a, button, [role="button"])
 * - Hidden on touch devices
 */
export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const isTouchDevice = useRef(false);

  // Raw mouse position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring-damped position for outer ring (slower follow)
  const ringX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.5 });
  const ringY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.5 });

  // Faster spring for inner dot
  const dotX = useSpring(mouseX, { stiffness: 300, damping: 25, mass: 0.2 });
  const dotY = useSpring(mouseY, { stiffness: 300, damping: 25, mass: 0.2 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    },
    [mouseX, mouseY, visible]
  );

  useEffect(() => {
    // Detect touch device
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice.current) return;

    const handleDown = () => setClicking(true);
    const handleUp = () => setClicking(false);

    const handleHoverCheck = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("a, button, [role='button'], [tabindex]") !== null;
      setHovering(isInteractive);
    };

    const handleLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleHoverCheck);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleHoverCheck);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [handleMouseMove]);

  // Don't render on touch devices or SSR
  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 48 : clicking ? 24 : 32,
          height: hovering ? 48 : clicking ? 24 : 32,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div
          className="w-full h-full rounded-full border transition-colors duration-200"
          style={{
            borderColor: hovering
              ? "var(--accent-gold)"
              : "rgba(255, 255, 255, 0.5)",
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hovering ? 6 : clicking ? 3 : 4,
          height: hovering ? 6 : clicking ? 3 : 4,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <div
          className="w-full h-full rounded-full transition-colors duration-200"
          style={{
            backgroundColor: hovering
              ? "var(--accent-gold)"
              : "rgba(255, 255, 255, 0.8)",
          }}
        />
      </motion.div>

    </>
  );
}
