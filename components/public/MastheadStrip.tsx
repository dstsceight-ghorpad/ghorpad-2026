"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { RevealText, RevealOnScroll } from "@/components/ui/RevealText";

const VISIT_KEY = "ghorpad_visit_count";

interface MastheadStripProps {
  articleCount?: number;
  contributorCount?: number;
  galleryCount?: number;
}

function AnimatedCounter({ value, inView }: { value: number; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || value === 0) return;
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span>{count.toLocaleString()}</span>;
}

export default function MastheadStrip({
  articleCount = 0,
  contributorCount = 0,
  galleryCount = 0,
}: MastheadStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10);
    const next = stored + 1;
    localStorage.setItem(VISIT_KEY, String(next));
    setVisitCount(next);
  }, []);

  const stats = [
    { label: "Articles & Poems", value: articleCount },
    { label: "Contributors", value: contributorCount },
    { label: "Photo Features", value: galleryCount },
  ];

  return (
    <section id="about" className="bg-background py-20 px-4 sm:px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <RevealText by="word" stagger={0.06}>WRITTEN BY STUDENTS.</RevealText>
            <br />
            <span className="text-gold">
              <RevealText by="word" delay={0.4} stagger={0.06}>READ BY THE WORLD.</RevealText>
            </span>
          </h2>
          <RevealOnScroll delay={0.6}>
            <p className="text-muted max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              GHORPAD is the editorial voice of MILIT - DSTSC 08. We publish
              student journalism that covers campus life, culture, opinion, sports,
              and technology. Our mission is to provide a platform where every
              student&apos;s perspective matters.
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <RevealOnScroll
              key={stat.label}
              delay={i * 0.12}
              className="text-center p-6 bg-surface rounded-lg border border-border-subtle"
            >
              <div className="font-serif text-3xl sm:text-4xl font-bold text-gold mb-2">
                <AnimatedCounter value={stat.value} inView={inView} />
              </div>
              <div className="font-mono text-[10px] tracking-widest text-muted uppercase">
                {stat.label}
              </div>
            </RevealOnScroll>
          ))}

          <RevealOnScroll
            delay={3 * 0.12}
            className="text-center p-6 bg-surface rounded-lg border border-border-subtle"
          >
            <div className="font-serif text-3xl sm:text-4xl font-bold text-gold mb-2">
              <AnimatedCounter value={visitCount} inView={inView} />
            </div>
            <div className="font-mono text-[10px] tracking-widest text-muted uppercase">
              Your Visits
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
