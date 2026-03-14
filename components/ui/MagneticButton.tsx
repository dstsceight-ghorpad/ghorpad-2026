"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum displacement in pixels (default: 10) */
  strength?: number;
  /** Spring stiffness (default: 200) */
  stiffness?: number;
  /** Spring damping (default: 15) */
  damping?: number;
  as?: "button" | "a" | "div";
  onClick?: () => void;
  href?: string;
  [key: string]: unknown;
}

/**
 * Magnetic button that subtly pulls toward the cursor on hover.
 * The button moves a few pixels toward the mouse position,
 * creating an organic "attracted" feel.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 10,
  stiffness = 200,
  damping = 15,
  as: Component = "button",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center, normalized to [-1, 1]
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Component
        className={`${className} transition-transform duration-200 ${
          isHovered ? "scale-105" : ""
        }`}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
}
