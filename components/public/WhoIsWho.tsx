"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PersonnelAvatar from "@/components/ui/PersonnelAvatar";
import type { Personnel, Division } from "@/types";
import { DIVISIONS } from "@/types";
import { loadPersonnel, getDisplayName } from "@/lib/personnel";
import PersonnelDetailOverlay from "./PersonnelDetailOverlay";
import { RevealText, RevealLine } from "@/components/ui/RevealText";

interface WhoIsWhoProps {
  personnel: Personnel[];
}

// ─── Shared small card for Staff Officers & Student Officers ────────────────

function PersonnelCard({
  person,
  onClick,
}: {
  person: Personnel;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group bg-surface border border-border-subtle rounded-lg overflow-hidden hover:border-gold/30 transition-all duration-300 h-full flex flex-col cursor-pointer"
    >
      {/* Avatar placeholder */}
      <div className="aspect-square bg-surface-light relative flex items-center justify-center overflow-hidden">
        <PersonnelAvatar
          src={person.avatar_url}
          alt={getDisplayName(person)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          iconSize={32}
        />
        {/* Rank is shown in display name */}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-serif text-sm font-semibold mb-1 group-hover:text-gold transition-colors leading-snug">
          {getDisplayName(person)}
        </h4>
        <p className="font-mono text-[10px] text-muted mb-1">
          {person.designation}
        </p>
        {person.unit_or_regiment && (
          <p className="font-mono text-[10px] text-gold/50 mt-auto">
            {person.unit_or_regiment}
          </p>
        )}
        {person.division && (
          <p className="font-mono text-[10px] text-muted mt-1">
            {person.division.toUpperCase()} DIV
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Commandant Card (large hero-style) ─────────────────────────────────────

function CommandantCard({
  person,
  onClick,
}: {
  person: Personnel;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-surface border border-gold/20 rounded-lg overflow-hidden cursor-pointer hover:border-gold/40 transition-all"
      >
        {/* Photo area — 2 of 5 columns on desktop */}
        <div className="lg:col-span-2 aspect-[3/4] lg:aspect-auto bg-surface-light relative flex items-center justify-center min-h-[280px]">
          <PersonnelAvatar
            src={person.avatar_url}
            alt={getDisplayName(person)}
            className="w-full h-full object-cover"
            iconSize={64}
            iconLabel="PHOTO"
          />
          {/* Gold accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-gold/30" />
        </div>

        {/* Content area — 3 of 5 columns */}
        <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <span className="font-mono text-xs tracking-widest text-gold mb-3">
            // COMMANDANT
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-1">
            {getDisplayName(person)}
          </h3>
          <p className="font-mono text-sm text-muted mb-1">
            {person.designation}
          </p>
          {person.unit_or_regiment && (
            <p className="font-mono text-xs text-gold/60 mb-4">
              {person.unit_or_regiment}
            </p>
          )}
          {person.bio && (
            <p className="text-muted text-sm sm:text-base leading-relaxed border-l-2 border-gold/30 pl-4 line-clamp-3">
              {person.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Deputy Commandant Card (slightly smaller) ─────────────────────────────

function DeputyCommandantCard({
  person,
  onClick,
}: {
  person: Personnel;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface border border-border-subtle rounded-lg overflow-hidden cursor-pointer hover:border-gold/30 transition-all"
      >
        {/* Photo — 1 column */}
        <div className="aspect-[3/4] md:aspect-auto bg-surface-light relative flex items-center justify-center min-h-[240px]">
          <PersonnelAvatar
            src={person.avatar_url}
            alt={getDisplayName(person)}
            className="w-full h-full object-cover"
            iconSize={48}
            iconLabel="PHOTO"
          />
        </div>

        {/* Content — 2 columns */}
        <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-center">
          <span className="font-mono text-xs tracking-widest text-gold mb-3">
            <RevealText>// DEPUTY COMMANDANT</RevealText>
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold mb-1">
            {getDisplayName(person)}
          </h3>
          <p className="font-mono text-sm text-muted mb-1">
            {person.designation}
          </p>
          {person.unit_or_regiment && (
            <p className="font-mono text-xs text-gold/60 mb-4">
              {person.unit_or_regiment}
            </p>
          )}
          {person.bio && (
            <p className="text-muted text-sm leading-relaxed line-clamp-3">
              {person.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Staff Officers Carousel (horizontal scroll) ───────────────────────────

function StaffOfficersCarousel({
  officers,
  onSelect,
}: {
  officers: Personnel[];
  onSelect: (p: Personnel) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 272; // ~w-64 (256) + gap (16)
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-16">
      {/* Sub-section header with scroll controls */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs tracking-widest text-gold">
          <RevealText>// STAFF OFFICERS</RevealText>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="group p-2.5 border border-border-subtle rounded-lg transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:border-gold/60 hover:bg-gold/5 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft
              size={16}
              className="text-muted group-hover:text-gold transition-colors"
            />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="group p-2.5 border border-border-subtle rounded-lg transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:border-gold/60 hover:bg-gold/5 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight
              size={16}
              className="text-muted group-hover:text-gold transition-colors"
            />
          </button>
        </div>
      </div>

      {/* Carousel with hidden scrollbar + edge fades */}
      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="hide-scrollbar overflow-x-auto pb-4 -mx-4 px-4"
        >
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {officers.map((officer, i) => (
              <motion.div
                key={officer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="w-56 sm:w-64 shrink-0"
              >
                <PersonnelCard
                  person={officer}
                  onClick={() => onSelect(officer)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Officers by Division (tabbed) ──────────────────────────────────

function StudentOfficersDivisions({
  officers,
  onSelect,
}: {
  officers: Personnel[];
  onSelect: (p: Personnel) => void;
}) {
  const [activeDivision, setActiveDivision] = useState<Division>("Manekshaw");
  const [expanded, setExpanded] = useState(false);

  const filtered = officers.filter((o) => o.division === activeDivision);
  const INITIAL_SHOW = 12;
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hasMore = filtered.length > INITIAL_SHOW;

  const divisionLabels: Record<Division, string> = {
    Manekshaw: "MANEKSHAW DIV",
    Cariappa: "CARIAPPA DIV",
    Arjan: "ARJAN DIV",
    Pereira: "PEREIRA DIV",
  };

  return (
    <div>
      {/* Sub-section header */}
      <div className="mb-6">
        <span className="font-mono text-xs tracking-widest text-gold">
          <RevealText>// STUDENT OFFICERS</RevealText>
        </span>
      </div>

      {/* Division tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DIVISIONS.map((div) => (
          <button
            key={div}
            onClick={() => {
              setActiveDivision(div);
              setExpanded(false);
            }}
            className={`font-mono text-xs px-4 py-1.5 rounded transition-all ${
              activeDivision === div
                ? "bg-gold text-background"
                : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
            }`}
          >
            {divisionLabels[div]}
          </button>
        ))}
      </div>

      {/* Officer grid for active division — key forces remount on tab switch */}
      <motion.div
        key={`${activeDivision}-${expanded}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {visible.map((officer, i) => (
          <motion.div
            key={officer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.02, 0.5) }}
          >
            <PersonnelCard
              person={officer}
              onClick={() => onSelect(officer)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* View All / Show Less toggle */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-mono text-xs px-6 py-2 border border-gold/50 text-gold rounded hover:bg-gold hover:text-background transition-all"
          >
            {expanded
              ? "SHOW LESS"
              : `VIEW ALL ${filtered.length} OFFICERS`}
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-muted font-mono text-sm py-12">
          No student officers listed for this division yet.
        </p>
      )}
    </div>
  );
}

// ─── Main WhoIsWho Section ──────────────────────────────────────────────────

export default function WhoIsWho({ personnel }: WhoIsWhoProps) {
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [mergedPersonnel, setMergedPersonnel] = useState<Personnel[]>(personnel);

  // Merge localStorage edits on client mount
  useEffect(() => {
    const merged = loadPersonnel();
    setMergedPersonnel(merged);
  }, []);

  const commandant = mergedPersonnel.find(
    (p) => p.personnel_role === "commandant"
  );
  const deputyCommandant = mergedPersonnel.find(
    (p) => p.personnel_role === "deputy_commandant"
  );
  const staffOfficers = mergedPersonnel
    .filter((p) => p.personnel_role === "staff_officer")
    .sort((a, b) => a.order - b.order);
  const studentOfficers = mergedPersonnel
    .filter((p) => p.personnel_role === "student_officer")
    .sort((a, b) => a.order - b.order);

  return (
    <section id="who-is-who" className="bg-surface py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header — scroll-triggered reveal */}
        <div className="mb-16">
          <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-2">
            <RevealText>// WHO IS WHO</RevealText>
          </h2>
          <RevealLine delay={0.2} className="w-12 h-0.5 bg-gold mb-4" />
          <p className="font-serif text-3xl sm:text-4xl font-bold">
            <RevealText by="word" delay={0.35} stagger={0.06}>The Leadership</RevealText>
          </p>
        </div>

        {/* Commandant */}
        {commandant && (
          <CommandantCard
            person={commandant}
            onClick={() => setSelectedPerson(commandant)}
          />
        )}

        {/* Deputy Commandant */}
        {deputyCommandant && (
          <DeputyCommandantCard
            person={deputyCommandant}
            onClick={() => setSelectedPerson(deputyCommandant)}
          />
        )}

        {/* Staff Officers */}
        {staffOfficers.length > 0 && (
          <StaffOfficersCarousel
            officers={staffOfficers}
            onSelect={setSelectedPerson}
          />
        )}

        {/* Student Officers by Division */}
        {studentOfficers.length > 0 && (
          <StudentOfficersDivisions
            officers={studentOfficers}
            onSelect={setSelectedPerson}
          />
        )}
      </div>

      {/* Detail Overlay */}
      {selectedPerson && (
        <PersonnelDetailOverlay
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </section>
  );
}
