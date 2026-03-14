"use client";

import { useEffect, useRef } from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export default function AnimatedLogo({
  size = 120,
  className = "",
}: AnimatedLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 2); // minimum 2x for crisp text
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const outerR = w * 0.46;
    const innerR = w * 0.39;
    const ringBand = outerR - innerR;
    let t = 0;

    function drawFrame() {
      if (!ctx) return;
      t += 0.015;
      ctx.clearRect(0, 0, w, h);

      // === OUTER GOLD RING with rotating shimmer ===
      const shimmerAngle = t * 0.6;
      for (let i = 0; i < 360; i += 1) {
        const angle = (i * Math.PI) / 180;
        const dist = Math.abs(
          ((i - (shimmerAngle * 180) / Math.PI + 540) % 360) - 180
        );
        const brightness = Math.max(0.3, 1 - dist / 140);
        const r = Math.floor(170 + 62 * brightness);
        const g = Math.floor(145 + 55 * brightness);
        const b = Math.floor(15 + 59 * brightness);
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = ringBand;
        ctx.beginPath();
        ctx.arc(cx, cy, (outerR + innerR) / 2, angle, angle + 0.025);
        ctx.stroke();
      }

      // Outer & inner ring edges (crisp borders)
      ctx.strokeStyle = "rgba(232,200,74,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.stroke();

      // Thin decorative line in middle of ring band
      ctx.strokeStyle = "rgba(255,230,100,0.15)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, (outerR + innerR) / 2, 0, Math.PI * 2);
      ctx.stroke();

      // === INNER DARK CIRCLE (drawn before ring text so flame doesn't cover text) ===
      const innerGrad = ctx.createRadialGradient(
        cx,
        cy - innerR * 0.15,
        0,
        cx,
        cy,
        innerR
      );
      innerGrad.addColorStop(0, "#2a2510");
      innerGrad.addColorStop(0.4, "#1c1a0a");
      innerGrad.addColorStop(1, "#0d0c04");
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 1, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle subtle border
      ctx.strokeStyle = "rgba(232,200,74,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 1, 0, Math.PI * 2);
      ctx.stroke();

      // === ANIMATED FLAME (top, above rings — drawn before text) ===
      drawAnimatedFlame(ctx, cx, cy - innerR * 0.42, w * 0.14, t);

      // === TEXT around the ring (drawn AFTER flame so text is always visible) ===
      // Both texts centered on the exact middle of the gold band
      const textR = (outerR + innerR) / 2;

      // Both arcs use ±0.47π so gaps at 3 o'clock and 9 o'clock are equal
      const arcHalf = Math.PI * 0.47;

      // Top arc: Institute name — centered at top
      drawCurvedText(
        ctx,
        "MILITARY INSTITUTE OF TECHNOLOGY",
        cx,
        cy,
        textR,
        -arcHalf,
        arcHalf,
        w * 0.03,
        true
      );

      // Bottom arc: Motto — centered at bottom, same radius
      drawCurvedText(
        ctx,
        "Victory through Technology",
        cx,
        cy,
        textR,
        -arcHalf,
        arcHalf,
        w * 0.025,
        false,
        false
      );

      // Separator stars at exactly 3 o'clock and 9 o'clock,
      // symmetrically centered in the gap between the two text arcs
      ctx.fillStyle = "rgba(45,35,10,0.85)";
      drawSmallStar(ctx, cx - textR, cy, w * 0.01);
      drawSmallStar(ctx, cx + textR, cy, w * 0.01);

      // === INTERLOCKING OLYMPIC-STYLE RINGS ===
      const ringR = w * 0.085;
      const ringY = cy + w * 0.02;
      const ringSpacing = ringR * 1.25;
      const ringGlow = 0.4 + 0.6 * Math.abs(Math.sin(t * 2));
      const lightningGlow = 0.3 + 0.7 * Math.abs(Math.sin(t * 3.5 + 1.2));

      // Subtle gold glow behind rings
      ctx.shadowColor = `rgba(232,200,74,${ringGlow * 0.4})`;
      ctx.shadowBlur = 6 + lightningGlow * 8;

      // Draw rings with proper interlocking
      drawRing(ctx, cx - ringSpacing, ringY, ringR, "#c0392b", 2.2);
      drawRing(ctx, cx, ringY - ringR * 0.18, ringR, "#2980b9", 2.2);
      drawRing(
        ctx,
        cx + ringSpacing,
        ringY,
        ringR,
        `rgba(232,200,74,${0.65 + lightningGlow * 0.35})`,
        2.2
      );

      // Lightning spark effect on rings
      if (lightningGlow > 0.75) {
        const sparkAlpha = (lightningGlow - 0.75) * 3;
        ctx.strokeStyle = `rgba(255,245,150,${sparkAlpha * 0.8})`;
        ctx.lineWidth = 1;
        const lx = cx + Math.sin(t * 5) * ringSpacing * 0.8;
        const ly = ringY + Math.cos(t * 7) * ringR * 0.4;
        drawLightningBolt(ctx, lx, ly, 5 + lightningGlow * 4, t);
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // === STARS (flanking the rings) ===
      const starY = cy + innerR * 0.02;
      drawStar(ctx, cx - innerR * 0.76, starY, w * 0.022, t);
      drawStar(ctx, cx + innerR * 0.76, starY, w * 0.022, t);

      // Small decorative dots between stars and rings
      const dotGlow = 0.4 + 0.6 * Math.sin(t * 2);
      ctx.fillStyle = `rgba(232,200,74,${dotGlow * 0.6})`;
      ctx.beginPath();
      ctx.arc(cx - innerR * 0.55, starY, w * 0.005, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + innerR * 0.55, starY, w * 0.005, 0, Math.PI * 2);
      ctx.fill();

      // === SWORD / DAGGER ===
      const swordTop = ringY + ringR * 0.75;
      const swordBottom = cy + innerR * 0.62;
      const swordGlow = 0.5 + 0.5 * Math.sin(t * 1.5);

      // Sword handle (pommel)
      ctx.fillStyle = `rgba(200,170,50,${0.6 + swordGlow * 0.4})`;
      ctx.beginPath();
      ctx.arc(cx, swordTop - 1, w * 0.012, 0, Math.PI * 2);
      ctx.fill();

      // Guard (horizontal cross-piece)
      ctx.strokeStyle = `rgba(200,170,50,${0.7 + swordGlow * 0.3})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.05, swordTop + 3);
      ctx.lineTo(cx + w * 0.05, swordTop + 3);
      ctx.stroke();

      // Blade (tapered)
      const bladeGrad = ctx.createLinearGradient(cx, swordTop + 3, cx, swordBottom);
      bladeGrad.addColorStop(0, `rgba(220,200,80,${0.7 + swordGlow * 0.3})`);
      bladeGrad.addColorStop(0.5, `rgba(200,180,60,${0.6 + swordGlow * 0.4})`);
      bladeGrad.addColorStop(1, `rgba(180,160,40,${0.4 + swordGlow * 0.3})`);
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 2.5, swordTop + 3);
      ctx.lineTo(cx + 2.5, swordTop + 3);
      ctx.lineTo(cx + 0.5, swordBottom);
      ctx.lineTo(cx - 0.5, swordBottom);
      ctx.closePath();
      ctx.fill();

      // Blade center line (fuller)
      ctx.strokeStyle = `rgba(255,240,120,${0.2 + swordGlow * 0.2})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, swordTop + 6);
      ctx.lineTo(cx, swordBottom - 2);
      ctx.stroke();

      // (EST. 2008 removed)

      animFrameRef.current = requestAnimationFrame(drawFrame);
    }

    drawFrame();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// === HELPER DRAWING FUNCTIONS ===

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number
) {
  const twinkle = 0.5 + 0.5 * Math.sin(t * 3);
  ctx.fillStyle = `rgba(220,200,70,${0.5 + twinkle * 0.5})`;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  lineWidth: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLightningBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  _t: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y - len);
  ctx.lineTo(x + len * 0.35, y - len * 0.15);
  ctx.lineTo(x - len * 0.05, y + len * 0.15);
  ctx.lineTo(x + len * 0.25, y + len);
  ctx.stroke();
}

function drawAnimatedFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseWidth: number,
  t: number
) {
  const flameHeight = baseWidth * 3;

  // Multiple flame layers for depth
  for (let layer = 0; layer < 4; layer++) {
    const phase = t * (2.5 + layer * 0.6) + layer * 1.5;
    const flicker = Math.sin(phase) * 0.15 + Math.cos(phase * 1.3) * 0.1;
    const widthMod = 1 + flicker * (layer === 0 ? 0.3 : 0.5);
    const heightMod = 1 + Math.sin(phase * 0.8) * 0.1;
    const xOffset = Math.sin(phase * 0.5) * baseWidth * 0.06 * layer;

    const fw = baseWidth * widthMod * (1 - layer * 0.18);
    const fh = flameHeight * heightMod * (1 - layer * 0.12);
    const fy = y - fh * 0.08;

    let alpha: number, r: number, g: number, b: number;
    switch (layer) {
      case 0:
        r = 220; g = 140; b = 10; alpha = 0.12;
        break;
      case 1:
        r = 232; g = 170; b = 30; alpha = 0.4;
        break;
      case 2:
        r = 245; g = 200; b = 60; alpha = 0.65;
        break;
      case 3:
        r = 255; g = 235; b = 130; alpha = 0.85;
        break;
      default:
        r = 232; g = 200; b = 74; alpha = 0.5;
    }

    const grad = ctx.createLinearGradient(
      x + xOffset,
      fy - fh,
      x + xOffset,
      fy + fw * 0.3
    );
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(0.25, `rgba(${r},${g},${b},${alpha * 0.6})`);
    grad.addColorStop(0.55, `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${alpha * 0.25})`);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(x + xOffset, fy - fh);
    ctx.bezierCurveTo(
      x + xOffset + fw * 0.35,
      fy - fh * 0.5,
      x + xOffset + fw * 0.6,
      fy - fh * 0.1,
      x + xOffset,
      fy + fw * 0.3
    );
    ctx.bezierCurveTo(
      x + xOffset - fw * 0.6,
      fy - fh * 0.1,
      x + xOffset - fw * 0.35,
      fy - fh * 0.5,
      x + xOffset,
      fy - fh
    );
    ctx.closePath();
    ctx.fill();
  }

  // Spark particles
  for (let i = 0; i < 4; i++) {
    const sparkPhase = t * 1.8 + i * 1.8;
    const sparkLife = sparkPhase % 1;
    if (sparkLife < 0.75) {
      const sx = x + Math.sin(sparkPhase * 3 + i) * baseWidth * 0.35;
      const sy = y - flameHeight * 0.25 - sparkLife * flameHeight * 0.55;
      const sparkAlpha = (1 - sparkLife / 0.75) * 0.7;
      ctx.fillStyle = `rgba(255,230,100,${sparkAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2 + (1 - sparkLife) * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSmallStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 8;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  fontSize: number,
  isTop: boolean,
  rightToLeft: boolean = false
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px "Playfair Display", "Georgia", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const totalAngle = endAngle - startAngle;
  const anglePerChar = totalAngle / (text.length + 1);

  for (let i = 0; i < text.length; i++) {
    let charAngle: number;
    if (isTop) {
      // Top: first char on the left, going clockwise to the right
      charAngle = -Math.PI / 2 + startAngle + anglePerChar * (i + 1);
    } else if (rightToLeft) {
      // Bottom right-to-left: first char on RIGHT side, going clockwise to LEFT
      // Reading right-to-left across the bottom gives the text in order
      charAngle = Math.PI / 2 + startAngle + anglePerChar * (i + 1);
    } else {
      // Bottom left-to-right: first char on right, going counter-clockwise
      charAngle = Math.PI / 2 + endAngle - anglePerChar * (i + 1);
    }

    const charX = cx + radius * Math.cos(charAngle);
    const charY = cy + radius * Math.sin(charAngle);

    ctx.save();
    ctx.translate(charX, charY);
    ctx.rotate(charAngle + (isTop ? Math.PI / 2 : -Math.PI / 2));

    // Dark shadow for contrast on gold band
    ctx.fillStyle = "rgba(30,25,5,0.9)";
    ctx.fillText(text[i], 0.5, 0.5);

    // Main text in bright cream/white
    ctx.fillStyle = "rgba(45,35,10,0.95)";
    ctx.fillText(text[i], 0, 0);

    ctx.restore();
  }

  ctx.restore();
}
