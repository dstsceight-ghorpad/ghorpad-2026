"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Cake, Heart, CalendarDays, Phone, Mail } from "lucide-react";
import PersonnelAvatar from "@/components/ui/PersonnelAvatar";
import type { Personnel } from "@/types";

interface PersonnelDetailOverlayProps {
  person: Personnel;
  onClose: () => void;
}

// ─── Detail row helper ────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon size={18} className="text-gold mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="font-mono text-[10px] text-muted block tracking-wider">
          {label}
        </span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-gold hover:text-gold/80 transition-colors break-all"
          >
            {value}
          </a>
        ) : (
          <span className="text-base text-foreground">{value}</span>
        )}
      </div>
    </div>
  );
}

// ─── Role label mapping ───────────────────────────────────────────────────────

function getRoleLabel(role: string): string {
  switch (role) {
    case "commandant":
      return "COMMANDANT";
    case "deputy_commandant":
      return "DEPUTY COMMANDANT";
    case "staff_officer":
      return "STAFF OFFICER";
    case "student_officer":
      return "STUDENT OFFICER";
    default:
      return role.toUpperCase();
  }
}

// ─── Main Overlay ─────────────────────────────────────────────────────────────

export default function PersonnelDetailOverlay({
  person,
  onClose,
}: PersonnelDetailOverlayProps) {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ESC key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const hasExtendedInfo =
    person.birthday ||
    person.spouse_name ||
    person.spouse_birthday ||
    person.anniversary ||
    person.whatsapp_no ||
    person.email;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Close button — always visible, top-right */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-subtle rounded-lg text-muted hover:text-foreground hover:border-gold/50 transition-all group"
        aria-label="Close"
      >
        <X
          size={18}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
        <span className="font-mono text-[10px] tracking-widest hidden sm:inline">
          ESC
        </span>
      </button>

      {/* Full-screen two-panel layout */}
      <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left panel: Photo (full height) ──────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative bg-surface-light flex items-center justify-center overflow-hidden h-[40vh] lg:h-full"
        >
          <PersonnelAvatar
            src={person.avatar_url}
            alt={person.name}
            className="w-full h-full object-cover"
            iconSize={120}
            iconLabel="PHOTO"
          />

          {/* Rank badge */}
          <div className="absolute top-5 left-5">
            <span className="font-mono text-xs bg-gold text-background px-4 py-1.5 rounded font-medium tracking-wider">
              {person.rank.toUpperCase()}
            </span>
          </div>

          {/* Bottom gradient overlay for text legibility on mobile */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/60 to-transparent lg:hidden" />

          {/* Gold accent bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold/60 to-gold/20" />
        </motion.div>

        {/* ── Right panel: Info (scrollable) ────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="h-[60vh] lg:h-full overflow-y-auto bg-background"
        >
          <div className="p-8 sm:p-10 lg:p-14 lg:pt-20 max-w-xl">
            {/* Role label */}
            <span className="font-mono text-xs tracking-[0.2em] text-gold mb-4 block">
              // {getRoleLabel(person.personnel_role)}
            </span>

            {/* Name */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
              {person.name}
            </h2>

            {/* Rank + Designation */}
            <p className="font-mono text-sm text-muted mb-1">
              {person.rank} &middot; {person.designation}
            </p>

            {/* Regiment */}
            {person.unit_or_regiment && (
              <p className="font-mono text-xs text-gold/60 mb-2">
                {person.unit_or_regiment}
              </p>
            )}

            {/* Division */}
            {person.division && (
              <p className="font-mono text-[10px] text-muted tracking-wider mb-6">
                {person.division.toUpperCase()} DIVISION
              </p>
            )}

            {!person.division && <div className="mb-6" />}

            {/* Extended Info rows */}
            {hasExtendedInfo && (
              <div className="border-t border-border-subtle pt-5 mt-2 space-y-1">
                {person.birthday && (
                  <DetailRow
                    icon={Cake}
                    label="BIRTHDAY"
                    value={person.birthday}
                  />
                )}

                {person.spouse_name && (
                  <DetailRow
                    icon={Heart}
                    label="SPOUSE"
                    value={
                      person.spouse_birthday
                        ? `${person.spouse_name} (B'Day: ${person.spouse_birthday})`
                        : person.spouse_name
                    }
                  />
                )}

                {!person.spouse_name && person.spouse_birthday && (
                  <DetailRow
                    icon={Heart}
                    label="SPOUSE BIRTHDAY"
                    value={person.spouse_birthday}
                  />
                )}

                {person.anniversary && (
                  <DetailRow
                    icon={CalendarDays}
                    label="ANNIVERSARY"
                    value={person.anniversary}
                  />
                )}

                {person.whatsapp_no && (
                  <DetailRow
                    icon={Phone}
                    label="WHATSAPP"
                    value={person.whatsapp_no}
                    href={`https://wa.me/${person.whatsapp_no.replace(/[^0-9]/g, "")}`}
                  />
                )}

                {person.email && (
                  <DetailRow
                    icon={Mail}
                    label="EMAIL"
                    value={person.email}
                    href={`mailto:${person.email}`}
                  />
                )}
              </div>
            )}

            {/* Bio section */}
            {person.bio && (
              <div className="border-t border-border-subtle pt-5 mt-5">
                <span className="font-mono text-xs tracking-[0.2em] text-gold mb-4 block">
                  // ABOUT
                </span>
                <p className="text-muted text-base leading-relaxed">
                  {person.bio}
                </p>
              </div>
            )}

            {/* Placeholder when no bio/extended info */}
            {!person.bio && !hasExtendedInfo && (
              <div className="border-t border-border-subtle pt-5 mt-2">
                <p className="text-muted/40 text-sm font-mono italic">
                  Profile details will be updated soon.
                </p>
              </div>
            )}

            {/* Bottom padding for scroll comfort */}
            <div className="h-10" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
