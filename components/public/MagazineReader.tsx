"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Hash,
  User,
  Play,
  Image as ImageIcon,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Quote,
  Cake,
  Heart,
  CalendarDays,
  Phone,
  Mail,
} from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";
import PersonnelAvatar from "@/components/ui/PersonnelAvatar";
import { getDisplayName } from "@/lib/personnel";
import type {
  Article,
  Personnel,
  TocEntry,
  Division,

  GalleryItem,
  CampusLocation,
} from "@/types";
import { DIVISIONS } from "@/types";
import { getCategoryBadgeClasses, getCategoryColor } from "@/lib/category-colors";

// ─── Types ───────────────────────────────────────────────────────────────────

type PageType =
  | "cover"
  | "toc"
  | "personnel-feature"
  | "staff"
  | "student-division"
  | "article"
  | "media"
  | "gallery"
  | "campus-map"
  | "back-cover";

interface MagazinePage {
  type: PageType;
  title: string;
  data?: unknown;
}

interface MagazineReaderProps {
  articles: Article[];
  personnel: Personnel[];
  tocEntries: TocEntry[];
  galleryItems: GalleryItem[];
  campusLocations: CampusLocation[];
  onClose: () => void;
}

// ─── Page Compilation ────────────────────────────────────────────────────────

function compilePages(
  articles: Article[],
  personnel: Personnel[],
  tocEntries: TocEntry[],
  galleryItems: GalleryItem[],
  campusLocations: CampusLocation[]
): MagazinePage[] {
  const pages: MagazinePage[] = [];

  // 1. Cover
  pages.push({ type: "cover", title: "Cover" });

  // 2. Table of Contents
  pages.push({ type: "toc", title: "Table of Contents", data: tocEntries });

  // 3. Commandant
  const commandant = personnel.find((p) => p.personnel_role === "commandant");
  if (commandant) {
    pages.push({
      type: "personnel-feature",
      title: "Commandant",
      data: commandant,
    });
  }

  // 4. Deputy Commandant
  const deputy = personnel.find(
    (p) => p.personnel_role === "deputy_commandant"
  );
  if (deputy) {
    pages.push({
      type: "personnel-feature",
      title: "Deputy Commandant",
      data: deputy,
    });
  }

  // 5. Staff Officers
  const staffOfficers = personnel
    .filter((p) => p.personnel_role === "staff_officer")
    .sort((a, b) => a.order - b.order);
  if (staffOfficers.length > 0) {
    pages.push({
      type: "staff",
      title: "Staff Officers",
      data: staffOfficers,
    });
  }

  // 6. Student Officers — one page per division
  for (const div of DIVISIONS) {
    const students = personnel
      .filter(
        (p) => p.personnel_role === "student_officer" && p.division === div
      )
      .sort((a, b) => a.order - b.order);
    if (students.length > 0) {
      pages.push({
        type: "student-division",
        title: `${div} Division`,
        data: { division: div, students },
      });
    }
  }

  // 7. Articles
  const published = articles.filter((a) => a.status === "published");
  for (const article of published) {
    pages.push({ type: "article", title: article.title, data: article });
  }

  // 8. Photo Gallery — paginate at 9 items per page
  const GALLERY_PAGE_SIZE = 9;
  const totalGalleryPages = Math.ceil(galleryItems.length / GALLERY_PAGE_SIZE);
  for (let i = 0; i < galleryItems.length; i += GALLERY_PAGE_SIZE) {
    const chunk = galleryItems.slice(i, i + GALLERY_PAGE_SIZE);
    const pageNum = Math.floor(i / GALLERY_PAGE_SIZE) + 1;
    pages.push({
      type: "gallery",
      title:
        totalGalleryPages > 1
          ? `Photo Gallery (${pageNum}/${totalGalleryPages})`
          : "Photo Gallery",
      data: chunk,
    });
  }

  // 9. Campus Map
  if (campusLocations.length > 0) {
    pages.push({
      type: "campus-map",
      title: "Campus Map",
      data: campusLocations,
    });
  }

  // 11. Media Vault
  pages.push({ type: "media", title: "Media Vault" });

  // 12. Back Cover
  pages.push({ type: "back-cover", title: "Back Cover" });

  return pages;
}

// ─── Detail Row Helper ───────────────────────────────────────────────────────

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
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="text-gold mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="font-mono text-[9px] text-muted block tracking-wider">
          {label}
        </span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-interactive
            className="text-sm text-gold hover:text-gold/80 transition-colors break-all"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-foreground">{value}</span>
        )}
      </div>
    </div>
  );
}

// ─── Student Officer Detail Overlay ──────────────────────────────────────────

function MagazinePersonnelDetail({
  person,
  onClose,
}: {
  person: Personnel;
  onClose: () => void;
}) {
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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 overflow-y-auto"
      style={{ backgroundColor: "var(--background)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={onClose}
          data-interactive="true"
          className="mb-6 flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="font-mono text-xs tracking-wider">
            BACK TO DIVISION
          </span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Photo */}
          <div className="aspect-[3/4] bg-surface rounded-lg border border-border-subtle flex items-center justify-center overflow-hidden">
            <PersonnelAvatar
              src={person.avatar_url}
              alt={getDisplayName(person)}
              className="w-full h-full object-cover object-top"
              iconSize={56}
              iconLabel="PHOTO"
            />
          </div>

          {/* Info */}
          <div className="md:col-span-2">
            {/* Role label removed */}
            <h3 className="font-serif text-2xl font-bold mb-1">
              {getDisplayName(person)}
            </h3>
            <p className="font-mono text-sm text-muted mb-1">
              {person.designation}
            </p>
            {person.unit_or_regiment && (
              <p className="font-mono text-xs text-gold/60 mb-2">
                {person.unit_or_regiment}
              </p>
            )}
            {person.division && (
              <p className="font-mono text-[10px] text-muted tracking-wider mb-5">
                {person.division.toUpperCase()} DIVISION
              </p>
            )}

            {/* Extended info */}
            {hasExtendedInfo && (
              <div className="border-t border-border-subtle pt-3 space-y-0">
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
                        ? `${person.spouse_name} (${person.spouse_birthday})`
                        : person.spouse_name
                    }
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

            {person.bio && (
              <div className="border-t border-border-subtle pt-4 mt-3">
                <span className="font-mono text-[10px] tracking-widest text-gold mb-3 block">
                  // ABOUT
                </span>
                <p className="text-muted text-sm leading-relaxed">
                  {person.bio}
                </p>
              </div>
            )}

            {!person.bio && !hasExtendedInfo && (
              <div className="border-t border-border-subtle pt-4 mt-3">
                <p className="text-muted/50 text-sm font-mono italic">
                  Profile details will be updated soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page Renderers ──────────────────────────────────────────────────────────

function CoverPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/20" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-gold/20" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-gold/20" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/20" />

      <AnimatedLogo size={180} />
      <p className="font-mono text-xs tracking-[0.4em] text-muted mt-6">
        DSTSC-08 PRESENTS
      </p>
      <h1 className="font-serif text-5xl sm:text-6xl font-bold mt-4 tracking-wide text-foreground">
        GHORPAD
      </h1>
      <p className="font-mono text-sm tracking-[0.3em] text-gold mt-2">
        2025-26
      </p>
      <div className="w-16 h-0.5 bg-gold/40 mt-8" />
      <p className="font-mono text-[10px] text-muted mt-4 tracking-widest">
        MILITARY INSTITUTE OF TECHNOLOGY
      </p>
      <p className="font-mono text-[10px] text-muted mt-8 animate-pulse">
        Click right side to begin &rarr;
      </p>
    </div>
  );
}

function TocPage({ entries }: { entries: TocEntry[] }) {
  const groups: Record<string, TocEntry[]> = {};
  for (const entry of entries) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category].push(entry);
  }

  return (
    <div>
      <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-2">
        // INDEX
      </h2>
      <div className="w-12 h-0.5 bg-gold mb-6" />
      <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-8">
        Table of Contents
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
        {Object.entries(groups).map(([category, items]) => {
          const catColor = getCategoryColor(category);
          return (
            <div key={category}>
              <h4
                className="font-serif text-sm font-semibold mb-3 border-b pb-1.5"
                style={{
                  color: catColor.hex,
                  borderColor: `${catColor.hex}33`,
                }}
              >
                {category}
              </h4>
              <div className="space-y-2">
                {items.map((entry) => (
                  <div key={entry.id} className="flex items-baseline gap-2">
                    <span
                      className="font-mono text-xs shrink-0 w-6"
                      style={{ color: catColor.hex }}
                    >
                      {entry.page_label}
                    </span>
                    <span className="font-serif text-sm text-foreground truncate">
                      {entry.title}
                    </span>
                    <span className="flex-1 border-b border-dotted border-border-subtle min-w-[12px]" />
                    <span className="font-mono text-[10px] text-muted shrink-0 uppercase">
                      {entry.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PersonnelFeaturePage({ person }: { person: Personnel }) {
  return (
    <div>
      {/* Role label removed */}
      <div className="w-12 h-0.5 bg-gold mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Photo area */}
        <div className="aspect-[3/4] bg-surface-light rounded-lg border border-border-subtle flex items-center justify-center overflow-hidden">
          <PersonnelAvatar
            src={person.avatar_url}
            alt={getDisplayName(person)}
            className="w-full h-full object-cover object-top rounded-lg"
            iconSize={56}
            iconLabel="PHOTO"
          />
        </div>

        {/* Details */}
        <div className="md:col-span-2 flex flex-col justify-center">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-1">
            {getDisplayName(person)}
          </h3>
          <p className="font-mono text-sm text-muted mb-1">
            {person.designation}
          </p>
          {person.unit_or_regiment && (
            <p className="font-mono text-xs text-gold/60 mb-6">
              {person.unit_or_regiment}
            </p>
          )}
          {person.bio && (
            <p className="text-muted text-sm leading-relaxed border-l-2 border-gold/30 pl-4">
              {person.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StaffPage({ officers }: { officers: Personnel[] }) {
  return (
    <div>
      {/* Role label removed */}
      <div className="w-12 h-0.5 bg-gold mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {officers.map((officer) => (
          <div
            key={officer.id}
            className="bg-surface border border-border-subtle rounded-lg overflow-hidden"
          >
            <div className="aspect-square bg-surface-light flex items-center justify-center relative">
              <PersonnelAvatar
                src={officer.avatar_url}
                alt={getDisplayName(officer)}
                className="w-full h-full object-cover object-top"
                iconSize={28}
              />
              {/* Rank is shown in display name */}
            </div>
            <div className="p-3">
              <h4 className="font-serif text-xs font-semibold leading-snug mb-0.5">
                {getDisplayName(officer)}
              </h4>
              <p className="font-mono text-[9px] text-muted">
                {officer.designation}
              </p>
              {officer.unit_or_regiment && (
                <p className="font-mono text-[9px] text-gold/50 mt-0.5">
                  {officer.unit_or_regiment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentDivisionPage({
  division,
  students,
  onSelectPerson,
}: {
  division: Division;
  students: Personnel[];
  onSelectPerson: (person: Personnel) => void;
}) {
  return (
    <div>
      {/* Role label removed */}
      <div className="w-12 h-0.5 bg-gold mb-4" />
      <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">
        {division} Division
        <span className="font-mono text-xs text-muted ml-3">
          ({students.length} officers)
        </span>
      </h3>
      <p className="font-mono text-[10px] text-muted mb-6">
        Click on any officer to view their profile
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {students.map((student) => (
          <div
            key={student.id}
            role="button"
            tabIndex={0}
            data-interactive="true"
            onClick={() => onSelectPerson(student)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectPerson(student);
              }
            }}
            className="bg-surface border border-border-subtle rounded p-2.5 cursor-pointer hover:border-gold/40 hover:bg-surface-light/50 transition-all group"
          >
            <p className="font-serif text-[11px] font-semibold leading-tight group-hover:text-gold transition-colors">
              {getDisplayName(student)}
            </p>
            {student.unit_or_regiment && (
              <p className="font-mono text-[9px] text-gold/70 mt-0.5 truncate">
                {student.unit_or_regiment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticlePage({ article }: { article: Article }) {
  return (
    <div>
      <span
        className={`font-mono text-[10px] px-2 py-0.5 rounded ${getCategoryBadgeClasses(article.category)}`}
      >
        {article.category.toUpperCase()}
      </span>

      <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-4 mb-3">
        {article.title}
      </h2>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
          <User size={14} className="text-muted" />
        </div>
        <div>
          <p className="font-serif text-sm">
            {article.author?.full_name || "Unknown"}
          </p>
          <p className="font-mono text-[10px] text-muted">
            {article.read_time_minutes} MIN READ
          </p>
        </div>
      </div>

      {/* Cover image placeholder */}
      {article.cover_image_url ? (
        <img
          src={article.cover_image_url}
          alt={article.title}
          className="w-full aspect-video object-cover rounded-lg mb-6"
        />
      ) : (
        <div className="w-full aspect-video bg-surface-light rounded-lg mb-6 flex items-center justify-center border border-border-subtle">
          <ImageIcon size={32} className="text-muted/30" />
        </div>
      )}

      {/* Excerpt */}
      <p className="text-base leading-relaxed text-foreground/80 mb-6 border-l-2 border-gold/30 pl-4 italic">
        {article.excerpt}
      </p>

      {/* Content or placeholder */}
      {article.content ? (
        <div className="prose-editorial text-sm leading-relaxed text-muted">
          <p className="text-muted">
            Full article content available in the editor.
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-muted leading-relaxed">
          <p>
            This article is part of the GHORPAD 2025-26 magazine. The full
            content will be available once the editorial team publishes it
            through the editorial dashboard.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags?.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] text-gold/70 border border-gold/20 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryPage({ items }: { items: GalleryItem[] }) {
  const aspectClass = (ratio: string) => {
    switch (ratio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-video";
      case "square":
      default:
        return "aspect-square";
    }
  };

  return (
    <div>
      <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-2">
        // PHOTO GALLERY
      </h2>
      <div className="w-12 h-0.5 bg-gold mb-8" />
      <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-6">
        Through the Lens
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg overflow-hidden border border-border-subtle bg-surface"
          >
            <div
              className={`relative bg-surface-light flex items-center justify-center ${aspectClass(item.aspect_ratio)}`}
            >
              {item.type === "video" ? (
                <div className="w-10 h-10 rounded-full bg-red-accent/80 flex items-center justify-center">
                  <Play size={16} className="text-white ml-0.5" />
                </div>
              ) : (
                <Camera size={20} className="text-muted/50" />
              )}
              <div className="absolute top-2 right-2">
                <span className="font-mono text-[9px] bg-gold text-background px-1.5 py-0.5 rounded">
                  {item.category.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="p-2.5">
              <p className="font-serif text-xs font-semibold truncate">
                {item.title}
              </p>
              {item.description && (
                <p className="font-mono text-[9px] text-muted mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


const LOCATION_COLORS: Record<string, string> = {
  building: "#8B6914",
  field: "#2E7D32",
  residential: "#5C6BC0",
  recreation: "#E65100",
  gate: "#6D4C41",
  medical: "#C62828",
};

function CampusMapPage({ locations }: { locations: CampusLocation[] }) {
  return (
    <div>
      <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-2">
        // CAMPUS MAP
      </h2>
      <div className="w-12 h-0.5 bg-gold mb-8" />
      <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-6">
        Navigate the Grounds
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(LOCATION_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-[9px] text-muted capitalize">
              {type}
            </span>
          </div>
        ))}
      </div>

      {/* Location directory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="flex items-start gap-3 bg-surface rounded-lg p-3 border border-border-subtle"
          >
            <div
              className="w-3 h-3 rounded-full mt-1 shrink-0"
              style={{
                backgroundColor:
                  LOCATION_COLORS[loc.icon_type] || LOCATION_COLORS.building,
              }}
            />
            <div className="min-w-0">
              <p className="font-serif text-sm font-semibold">{loc.name}</p>
              <p className="text-[11px] text-muted mt-0.5">{loc.description}</p>
              {loc.fun_fact && (
                <p className="text-[10px] text-gold/60 mt-1 italic">
                  {loc.fun_fact}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaPage() {
  const mediaItems = [
    { id: "m1", title: "Tech Fest Opening Ceremony", type: "image" },
    { id: "m2", title: "Cricket Finals Highlights", type: "video" },
    { id: "m3", title: "Cultural Night Performances", type: "image" },
    { id: "m4", title: "Lab Inauguration", type: "image" },
    { id: "m5", title: "Student Panel Discussion", type: "video" },
    { id: "m6", title: "Campus Drone View", type: "image" },
  ];

  return (
    <div>
      <h2 className="font-mono text-xs tracking-[0.3em] text-gold mb-2">
        // MEDIA VAULT
      </h2>
      <div className="w-12 h-0.5 bg-gold mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="rounded-lg overflow-hidden border border-border-subtle"
          >
            <div className="aspect-video bg-surface-light relative flex items-center justify-center">
              {item.type === "video" ? (
                <div className="w-10 h-10 rounded-full bg-red-accent/80 flex items-center justify-center">
                  <Play size={16} className="text-white ml-0.5" />
                </div>
              ) : (
                <ImageIcon size={20} className="text-muted/40" />
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="font-mono text-[10px] text-foreground">
                  {item.title}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BackCoverPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/20" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-gold/20" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-gold/20" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/20" />

      <AnimatedLogo size={100} />

      <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-6 tracking-wide text-foreground/40">
        GHORPAD
      </h2>
      <p className="font-mono text-xs tracking-[0.3em] text-gold/60 mt-2">
        2025-26
      </p>

      <div className="w-16 h-0.5 bg-gold/30 mt-8 mb-8" />

      <p className="font-serif text-lg text-foreground/70 mb-2">
        Thank you for reading
      </p>
      <p className="font-mono text-[10px] text-muted tracking-widest mt-4">
        PUBLISHED BY MILIT &mdash; DSTSC 08
      </p>
      <p className="font-mono text-[10px] text-muted/70 mt-1">
        MILITARY INSTITUTE OF TECHNOLOGY
      </p>
    </div>
  );
}

// ─── Page Renderer Switch ────────────────────────────────────────────────────

function PageRenderer({
  page,
  onSelectPerson,
}: {
  page: MagazinePage;
  onSelectPerson: (person: Personnel) => void;
}) {
  switch (page.type) {
    case "cover":
      return <CoverPage />;
    case "toc":
      return <TocPage entries={page.data as TocEntry[]} />;
    case "personnel-feature":
      return <PersonnelFeaturePage person={page.data as Personnel} />;
    case "staff":
      return <StaffPage officers={page.data as Personnel[]} />;
    case "student-division": {
      const d = page.data as { division: Division; students: Personnel[] };
      return (
        <StudentDivisionPage
          division={d.division}
          students={d.students}
          onSelectPerson={onSelectPerson}
        />
      );
    }
    case "article":
      return <ArticlePage article={page.data as Article} />;
    case "gallery":
      return <GalleryPage items={page.data as GalleryItem[]} />;
    case "campus-map":
      return <CampusMapPage locations={page.data as CampusLocation[]} />;
    case "media":
      return <MediaPage />;
    case "back-cover":
      return <BackCoverPage />;
    default:
      return null;
  }
}

// ─── Main Magazine Reader ────────────────────────────────────────────────────

export default function MagazineReader({
  articles,
  personnel,
  tocEntries,
  galleryItems,
  campusLocations,
  onClose,
}: MagazineReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showGoTo, setShowGoTo] = useState(false);
  const [goToValue, setGoToValue] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);

  // Touch gesture tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const pages = useMemo(
    () =>
      compilePages(
        articles,
        personnel,
        tocEntries,
        galleryItems,
        campusLocations
      ),
    [articles, personnel, tocEntries, galleryItems, campusLocations]
  );
  const totalPages = pages.length;

  // Lock body scroll when reader is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const goToPage = useCallback(
    (pageNum: number) => {
      const target = Math.max(0, Math.min(pageNum, totalPages - 1));
      setDirection(target > currentPage ? 1 : -1);
      setCurrentPage(target);
      setSelectedPerson(null);
    },
    [currentPage, totalPages]
  );

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
      setSelectedPerson(null);
    }
  }, [currentPage, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
      setSelectedPerson(null);
    }
  }, [currentPage]);

  const goToStart = useCallback(() => {
    setDirection(-1);
    setCurrentPage(0);
    setSelectedPerson(null);
  }, []);

  const handleGoToSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const num = parseInt(goToValue, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        goToPage(num - 1);
        setShowGoTo(false);
        setGoToValue("");
      }
    },
    [goToValue, goToPage, totalPages]
  );

  // Half-page click navigation
  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Skip when detail overlay is open
      if (selectedPerson) return;

      // Don't intercept clicks on interactive elements
      const target = e.target as HTMLElement;
      if (
        target.closest(
          "[data-interactive], button, a, input, select, textarea, [role='button']"
        )
      ) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      if (clickX > rect.width / 2) {
        goNext();
      } else {
        goPrev();
      }
    },
    [selectedPerson, goNext, goPrev]
  );

  // Touch swipe gesture
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || selectedPerson) return;
      const diffX =
        touchStartRef.current.x - e.changedTouches[0].clientX;
      const diffY =
        touchStartRef.current.y - e.changedTouches[0].clientY;

      // Only trigger on primarily horizontal swipes
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) goNext(); // swiped left → next
        else goPrev(); // swiped right → prev
      }
      touchStartRef.current = null;
    },
    [selectedPerson, goNext, goPrev]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          if (selectedPerson) return;
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          if (selectedPerson) return;
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          e.preventDefault();
          if (selectedPerson) {
            setSelectedPerson(null);
          } else {
            onClose();
          }
          break;
        case "Home":
          if (selectedPerson) return;
          e.preventDefault();
          goToStart();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose, goToStart, selectedPerson]);

  // Progress percentage
  const progressPercent = ((currentPage + 1) / totalPages) * 100;

  return (
    <div className="magazine-theme fixed inset-0 z-[90] bg-background flex flex-col">
      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-subtle bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <AnimatedLogo size={28} />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-sm font-bold tracking-tight">
              GHORPAD
            </span>
            <span className="font-mono text-[8px] text-gold tracking-widest">
              MAGAZINE READER
            </span>
          </div>
        </div>

        <p className="hidden sm:block font-mono text-xs text-muted truncate max-w-[300px] mx-4">
          {pages[currentPage]?.title}
        </p>

        <button
          onClick={onClose}
          data-interactive="true"
          className="p-2 text-muted hover:text-foreground hover:bg-surface-light rounded transition-colors"
          aria-label="Close reader"
        >
          <X size={20} />
        </button>
      </div>

      {/* ─── Page Content ────────────────────────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden"
        onClick={handleContentClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left hover hint */}
        <div className="absolute inset-y-0 left-0 w-16 z-20 pointer-events-none flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <ChevronLeft
            size={28}
            className="text-foreground/30"
          />
        </div>
        {/* Right hover hint */}
        <div className="absolute inset-y-0 right-0 w-16 z-20 pointer-events-none flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <ChevronRight
            size={28}
            className="text-foreground/30"
          />
        </div>

        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: direction >= 0 ? 200 : -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative">
            <PageRenderer
              page={pages[currentPage]}
              onSelectPerson={setSelectedPerson}
            />
          </div>
        </motion.div>

        {/* Student officer detail overlay */}
        <AnimatePresence>
          {selectedPerson && (
            <MagazinePersonnelDetail
              person={selectedPerson}
              onClose={() => setSelectedPerson(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Toolbar ──────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border-subtle bg-surface">
        {/* Progress bar */}
        <div className="h-0.5 bg-surface-light">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={currentPage + 1}
            aria-valuemax={totalPages}
          />
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5">
          {/* Previous */}
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            data-interactive="true"
            className="p-1.5 text-muted hover:text-gold disabled:text-muted/50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page counter */}
          <span className="font-mono text-xs text-muted min-w-[90px] text-center select-none">
            {currentPage + 1} / {totalPages}
          </span>

          {/* Go to page toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowGoTo(!showGoTo);
                setGoToValue("");
              }}
              data-interactive="true"
              className="p-1.5 text-muted hover:text-gold transition-colors"
              aria-label="Go to page"
            >
              <Hash size={14} />
            </button>

            {showGoTo && (
              <form
                onSubmit={handleGoToSubmit}
                data-interactive="true"
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-2 bg-surface border border-border-subtle rounded-lg p-2 shadow-lg"
              >
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={goToValue}
                  onChange={(e) => setGoToValue(e.target.value)}
                  placeholder={`1-${totalPages}`}
                  data-interactive="true"
                  className="w-16 bg-surface-light border border-border-subtle rounded px-2 py-1 text-xs font-mono text-center focus:outline-none focus:border-gold text-foreground"
                  autoFocus
                />
                <button
                  type="submit"
                  data-interactive="true"
                  className="font-mono text-[10px] bg-gold text-background px-2 py-1 rounded hover:bg-gold/90 transition-colors"
                >
                  GO
                </button>
              </form>
            )}
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={currentPage === totalPages - 1}
            data-interactive="true"
            className="p-1.5 text-muted hover:text-gold disabled:text-muted/50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
