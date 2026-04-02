"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Briefcase, GraduationCap, Quote } from "lucide-react";
import PersonnelAvatar from "@/components/ui/PersonnelAvatar";
import type { Alumni, CareerDomain } from "@/types";
import {
  getCareerDomainColor,
  getCareerDomainLabel,
} from "@/lib/category-colors";
import { SectionHeading, RevealOnScroll } from "@/components/ui/RevealText";
import TiltCard from "@/components/ui/TiltCard";

const CAREER_DOMAINS: CareerDomain[] = [
  "military",
  "defense_government",
  "corporate",
  "academic",
  "entrepreneurship",
];

interface AlumniSpotlightProps {
  alumni: Alumni[];
}

export default function AlumniSpotlight({ alumni }: AlumniSpotlightProps) {
  const [activeFilter, setActiveFilter] = useState<CareerDomain | "all">("all");

  const featured = alumni.find((a) => a.is_featured);
  const nonFeatured = alumni.filter((a) => !a.is_featured);

  const filtered =
    activeFilter === "all"
      ? nonFeatured
      : nonFeatured.filter((a) => a.career_domain === activeFilter);

  return (
    <section id="alumni" className="bg-background py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <SectionHeading
          label="ALUMNI SPOTLIGHT"
          title="Where Are They Now"
          className="mb-10"
        />

        {/* Featured Alumni Card */}
        {featured && (
          <RevealOnScroll className="mb-14">
            <div className="grid md:grid-cols-5 gap-6 bg-surface rounded-xl border border-border-subtle overflow-hidden">
              {/* Avatar area */}
              <div className="md:col-span-2 relative bg-surface-light flex items-center justify-center min-h-[280px]">
                <PersonnelAvatar
                  src={featured.avatar_url}
                  alt={featured.name}
                  className="w-full h-full object-cover"
                  iconSize={40}
                  iconLabel="FEATURED ALUMNI"
                />
                {/* Career domain badge */}
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider text-white"
                  style={{
                    backgroundColor:
                      getCareerDomainColor(featured.career_domain).hex,
                  }}
                >
                  {getCareerDomainLabel(featured.career_domain).toUpperCase()}
                </div>
              </div>

              {/* Info area */}
              <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center">
                {/* Quote */}
                <div className="relative mb-6">
                  <Quote
                    size={24}
                    className="text-gold/30 absolute -top-2 -left-1"
                  />
                  <p className="font-serif text-lg sm:text-xl italic text-foreground/90 pl-7 leading-relaxed">
                    &ldquo;{featured.quote}&rdquo;
                  </p>
                </div>

                {/* Name & batch */}
                <h3 className="font-serif text-2xl font-bold mb-1">
                  {featured.name}
                </h3>
                <div className="font-mono text-xs text-gold mb-4">
                  BATCH OF {featured.batch_year}
                </div>

                {/* Role & org */}
                <div className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Briefcase size={14} className="text-gold/60" />
                  <span>
                    {featured.current_role}, {featured.organization}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted mb-5">
                  <MapPin size={14} className="text-gold/60" />
                  <span>{featured.location}</span>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted leading-relaxed">
                  {featured.bio}
                </p>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 rounded-full font-mono text-[11px] tracking-wider transition-all duration-200 border ${
              activeFilter === "all"
                ? "bg-gold text-background border-gold"
                : "bg-transparent text-muted border-border-subtle hover:border-gold/40 hover:text-foreground"
            }`}
          >
            ALL
          </button>
          {CAREER_DOMAINS.map((domain) => {
            const color = getCareerDomainColor(domain);
            const isActive = activeFilter === domain;
            return (
              <button
                key={domain}
                onClick={() => setActiveFilter(domain)}
                className={`px-4 py-1.5 rounded-full font-mono text-[11px] tracking-wider transition-all duration-200 border ${
                  isActive
                    ? "text-white border-transparent"
                    : "bg-transparent text-muted border-border-subtle hover:border-gold/40 hover:text-foreground"
                }`}
                style={
                  isActive
                    ? { backgroundColor: color.hex, borderColor: color.hex }
                    : undefined
                }
              >
                {getCareerDomainLabel(domain).toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Alumni Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((person, i) => {
            const domainColor = getCareerDomainColor(person.career_domain);
            return (
              <RevealOnScroll key={person.id} delay={i * 0.08}>
                <TiltCard maxTilt={5} hoverScale={1.01}>
                  <div className="group bg-surface rounded-lg border border-border-subtle overflow-hidden hover:border-gold/20 transition-all duration-300">
                    {/* Avatar placeholder */}
                    <div className="relative h-48 bg-surface-light flex items-center justify-center overflow-hidden">
                      <PersonnelAvatar
                        src={person.avatar_url}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        iconSize={28}
                      />

                      {/* Batch badge */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-background/70 backdrop-blur-sm">
                        <span className="font-mono text-[10px] text-gold">
                          {person.batch_year}
                        </span>
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h4 className="font-serif text-base font-semibold mb-1 group-hover:text-gold transition-colors">
                        {person.name}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                        <Briefcase size={12} className="shrink-0" />
                        <span className="truncate">{person.current_role}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                        <GraduationCap size={12} className="shrink-0" />
                        <span className="truncate">{person.organization}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted/70 mb-3">
                        <MapPin size={11} className="shrink-0" />
                        <span>{person.location}</span>
                      </div>

                      {/* Quote preview */}
                      <p className="text-xs text-muted/60 italic leading-relaxed line-clamp-2">
                        &ldquo;{person.quote}&rdquo;
                      </p>
                    </div>

                    {/* Domain color bar */}
                    <div
                      className="h-0.5 w-full transition-all duration-500"
                      style={{ backgroundColor: domainColor.hex }}
                    />
                  </div>
                </TiltCard>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <GraduationCap
              size={40}
              className="text-muted/30 mx-auto mb-4"
            />
            <p className="font-mono text-sm text-muted">
              No alumni found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
