"use client";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export default function AnimatedLogo({
  size = 120,
  className = "",
}: AnimatedLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Military Institute of Technology"
      width={size}
      height={size}
      draggable={false}
      className={`${className} object-cover rounded-full`}
      style={{ width: size, height: size }}
    />
  );
}
