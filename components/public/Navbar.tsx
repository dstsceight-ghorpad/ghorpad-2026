"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import AnimatedLogo from "./AnimatedLogo";
import MagneticButton from "@/components/ui/MagneticButton";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "INDEX", href: "/#index" },
  { label: "WHO IS WHO", href: "/#who-is-who" },
  { label: "ARTICLES", href: "/#articles" },
  { label: "GALLERY", href: "/#gallery" },
  { label: "CONTRIBUTE", href: "/submit" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-gold/20 py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <AnimatedLogo size={scrolled ? 36 : 44} />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg sm:text-xl font-bold text-foreground tracking-tight">
              GHORPAD
            </span>
            <span className="font-mono text-[9px] text-gold tracking-widest">
              2026 &middot; MILIT
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-mono text-xs tracking-widest text-muted hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg border border-border-subtle hover:border-gold/50 transition-all group"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Sun
              size={16}
              className={cn(
                "absolute inset-0 m-auto transition-all duration-300",
                theme === "light"
                  ? "rotate-0 scale-100 text-gold"
                  : "rotate-90 scale-0 text-gold"
              )}
            />
            <Moon
              size={16}
              className={cn(
                "transition-all duration-300",
                theme === "dark"
                  ? "rotate-0 scale-100 text-gold"
                  : "-rotate-90 scale-0 text-gold"
              )}
            />
          </button>

          {/* Live dot */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-accent live-pulse" />
            <span className="font-mono text-xs text-red-accent font-semibold">
              LIVE
            </span>
          </div>

          {/* Editorial Login — magnetic pull */}
          <MagneticButton as="div" strength={6} className="hidden sm:inline-block">
            <Link
              href="/editorial/login"
              className="block font-mono text-xs border border-gold text-gold px-3 py-1.5 rounded hover:bg-gold hover:text-background transition-all"
            >
              EDITORIAL LOGIN
            </Link>
          </MagneticButton>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden glass border-t border-border-subtle mt-2">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-mono text-sm text-muted hover:text-gold transition-colors py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/editorial/login"
              className="font-mono text-sm border border-gold text-gold px-3 py-2 rounded text-center hover:bg-gold hover:text-background transition-all mt-2"
              onClick={() => setMenuOpen(false)}
            >
              EDITORIAL LOGIN
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
