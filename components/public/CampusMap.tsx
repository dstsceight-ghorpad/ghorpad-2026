"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Trees,
  Home,
  Dumbbell,
  DoorOpen,
  Stethoscope,
  Compass,
  X,
  Sparkles,
} from "lucide-react";
import type { CampusLocation, LocationIconType } from "@/types";
import { SectionHeading, RevealOnScroll } from "@/components/ui/RevealText";

// ─── Icon + Color mapping per location type ──────────────────

const locationConfig: Record<
  LocationIconType,
  { icon: typeof Building2; color: string; label: string }
> = {
  building: { icon: Building2, color: "#3b82f6", label: "Building" },
  field: { icon: Trees, color: "#10b981", label: "Field / Range" },
  residential: { icon: Home, color: "#f59e0b", label: "Residential" },
  recreation: { icon: Dumbbell, color: "#8b5cf6", label: "Recreation" },
  gate: { icon: DoorOpen, color: "#f43f5e", label: "Gate / Entry" },
  medical: { icon: Stethoscope, color: "#06b6d4", label: "Medical" },
};

// ─── Grid references for edges ───────────────────────────────

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ROW_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

interface CampusMapProps {
  locations: CampusLocation[];
}

export default function CampusMap({ locations }: CampusMapProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<CampusLocation | null>(null);

  return (
    <section id="campus-map" className="bg-surface py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <SectionHeading
          label="// CAMPUS MAP"
          title="Navigate the Grounds"
          className="mb-10"
        />

        <RevealOnScroll>
          <div className="grid lg:grid-cols-4 gap-6">
            {/* ─── SVG Map Area (3 cols) ───────────────── */}
            <div className="lg:col-span-3">
              <div className="relative bg-background rounded-xl border border-border-subtle overflow-hidden">
                <svg
                  viewBox="0 0 1000 562"
                  className="w-full h-auto"
                  style={{ aspectRatio: "16/9" }}
                >
                  {/* Background */}
                  <rect
                    width="1000"
                    height="562"
                    fill="var(--background)"
                  />

                  {/* Grid lines */}
                  {Array.from({ length: 11 }, (_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 100}
                      y1={0}
                      x2={i * 100}
                      y2={562}
                      stroke="var(--border-subtle)"
                      strokeWidth={0.5}
                    />
                  ))}
                  {Array.from({ length: 11 }, (_, i) => (
                    <line
                      key={`h-${i}`}
                      x1={0}
                      y1={i * 56.2}
                      x2={1000}
                      y2={i * 56.2}
                      stroke="var(--border-subtle)"
                      strokeWidth={0.5}
                    />
                  ))}

                  {/* Column labels (top) */}
                  {COL_LABELS.map((label, i) => (
                    <text
                      key={`col-${label}`}
                      x={i * 100 + 50}
                      y={16}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={10}
                      fontFamily="var(--font-mono)"
                      opacity={0.4}
                    >
                      {label}
                    </text>
                  ))}

                  {/* Row labels (left) */}
                  {ROW_LABELS.map((label, i) => (
                    <text
                      key={`row-${label}`}
                      x={12}
                      y={i * 56.2 + 32}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={10}
                      fontFamily="var(--font-mono)"
                      opacity={0.4}
                    >
                      {label}
                    </text>
                  ))}

                  {/* Compass rose */}
                  <g transform="translate(940, 50)">
                    <circle
                      r={22}
                      fill="none"
                      stroke="var(--accent-gold)"
                      strokeWidth={0.5}
                      opacity={0.3}
                    />
                    <text
                      y={-28}
                      textAnchor="middle"
                      fill="var(--accent-gold)"
                      fontSize={10}
                      fontFamily="var(--font-mono)"
                      fontWeight="bold"
                      opacity={0.6}
                    >
                      N
                    </text>
                    <text
                      y={38}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={8}
                      fontFamily="var(--font-mono)"
                      opacity={0.4}
                    >
                      S
                    </text>
                    <text
                      x={30}
                      y={4}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={8}
                      fontFamily="var(--font-mono)"
                      opacity={0.4}
                    >
                      E
                    </text>
                    <text
                      x={-30}
                      y={4}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={8}
                      fontFamily="var(--font-mono)"
                      opacity={0.4}
                    >
                      W
                    </text>
                    {/* Compass needle */}
                    <line
                      x1={0}
                      y1={-18}
                      x2={0}
                      y2={18}
                      stroke="var(--accent-gold)"
                      strokeWidth={1}
                      opacity={0.5}
                    />
                    <polygon
                      points="0,-18 -4,-10 4,-10"
                      fill="var(--accent-gold)"
                      opacity={0.6}
                    />
                  </g>

                  {/* Map border label */}
                  <text
                    x={500}
                    y={552}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                    opacity={0.3}
                    letterSpacing={4}
                  >
                    MILIT CAMPUS — NOT TO SCALE
                  </text>

                  {/* Location pins */}
                  {locations.map((loc) => {
                    const config = locationConfig[loc.icon_type];
                    const cx = (loc.x / 100) * 1000;
                    const cy = (loc.y / 100) * 562;
                    const isSelected = selectedLocation?.id === loc.id;

                    return (
                      <g
                        key={loc.id}
                        transform={`translate(${cx}, ${cy})`}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedLocation(
                            isSelected ? null : loc
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedLocation(
                              isSelected ? null : loc
                            );
                          }
                        }}
                      >
                        {/* Pulse ring */}
                        <circle
                          r={12}
                          fill="none"
                          stroke={config.color}
                          strokeWidth={1.5}
                          opacity={0.6}
                          className="map-pin-pulse"
                        />

                        {/* Pin circle */}
                        <circle
                          r={8}
                          fill={config.color}
                          opacity={isSelected ? 1 : 0.8}
                          stroke={
                            isSelected
                              ? "var(--accent-gold)"
                              : "var(--background)"
                          }
                          strokeWidth={isSelected ? 2 : 1.5}
                        />

                        {/* Pin icon (simplified — using a dot) */}
                        <circle r={2.5} fill="white" opacity={0.9} />

                        {/* Label */}
                        <text
                          y={-16}
                          textAnchor="middle"
                          fill="var(--foreground)"
                          fontSize={9}
                          fontFamily="var(--font-mono)"
                          opacity={isSelected ? 1 : 0}
                          style={{
                            transition: "opacity 0.2s ease",
                            pointerEvents: "none",
                          }}
                        >
                          {loc.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* ─── Detail Panel (1 col) ────────────────── */}
            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {selectedLocation ? (
                  <motion.div
                    key={selectedLocation.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="bg-background rounded-xl border border-border-subtle p-5 relative"
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors"
                      aria-label="Close detail"
                    >
                      <X size={16} />
                    </button>

                    {/* Icon + type */}
                    {(() => {
                      const config =
                        locationConfig[selectedLocation.icon_type];
                      const Icon = config.icon;
                      return (
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: config.color + "20",
                            }}
                          >
                            <Icon
                              size={20}
                              style={{ color: config.color }}
                            />
                          </div>
                          <div>
                            <span
                              className="font-mono text-[10px] tracking-widest"
                              style={{ color: config.color }}
                            >
                              {config.label.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Name */}
                    <h4 className="font-serif text-lg font-bold mb-3">
                      {selectedLocation.name}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {selectedLocation.description}
                    </p>

                    {/* Fun fact */}
                    {selectedLocation.fun_fact && (
                      <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles
                            size={12}
                            className="text-gold"
                          />
                          <span className="font-mono text-[10px] text-gold tracking-wider">
                            FUN FACT
                          </span>
                        </div>
                        <p className="text-xs text-muted/80 leading-relaxed">
                          {selectedLocation.fun_fact}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-background rounded-xl border border-border-subtle p-5 flex flex-col items-center justify-center min-h-[200px] text-center"
                  >
                    <Compass
                      size={32}
                      className="text-muted/20 mb-3"
                    />
                    <p className="font-mono text-xs text-muted/50 tracking-wider">
                      SELECT A LOCATION
                    </p>
                    <p className="text-xs text-muted/30 mt-1">
                      Click any pin on the map
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="mt-4 bg-background rounded-xl border border-border-subtle p-4">
                <h5 className="font-mono text-[10px] text-gold tracking-widest mb-3">
                  // LEGEND
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.entries(locationConfig) as [
                      LocationIconType,
                      (typeof locationConfig)[LocationIconType],
                    ][]
                  ).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={type}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <div className="flex items-center gap-1">
                          <Icon
                            size={11}
                            style={{ color: config.color }}
                            className="shrink-0"
                          />
                          <span className="font-mono text-[10px] text-muted truncate">
                            {config.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
