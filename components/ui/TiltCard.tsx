"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt angle in degrees (default: 6) */
  maxTilt?: number;
  /** Perspective distance in px (default: 800) */
  perspective?: number;
  /** Show a glare highlight that follows the cursor (default: true) */
  glare?: boolean;
  /** Scale on hover (default: 1.02) */
  hoverScale?: number;
}

/**
 * 3D tilt card that rotates based on cursor position.
 * Creates a subtle depth effect with optional glare highlight.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  perspective = 800,
  glare = true,
  hoverScale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();

      // Normalized position [-1, 1]
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      // Rotate X is inverted (mouse at top → tilt forward)
      rotateX.set(-ny * maxTilt * 2);
      rotateY.set(nx * maxTilt * 2);

      // Glare position (percentage)
      glareX.set(((e.clientX - rect.left) / rect.width) * 100);
      glareY.set(((e.clientY - rect.top) / rect.height) * 100);
    },
    [maxTilt, rotateX, rotateY, glareX, glareY]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{ scale: isHovered ? hoverScale : 1 }}
        transition={{ scale: { duration: 0.2 } }}
        className="relative w-full"
      >
        {children}

        {/* Glare overlay */}
        {glare && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none z-10"
            style={{
              background: `radial-gradient(
                circle at ${glareX.get()}% ${glareY.get()}%,
                rgba(255, 255, 255, 0.08) 0%,
                transparent 60%
              )`,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
