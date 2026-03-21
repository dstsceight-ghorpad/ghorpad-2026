import Link from "next/link";

const footerLinks = [
  { label: "About", href: "/#about" },
  { label: "Archive", href: "/#articles" },
  { label: "Submit Content", href: "/submit" },
  { label: "Editorial Policy", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative bg-surface border-t border-gold/20 pt-16 pb-8 px-4 sm:px-6">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <span className="font-serif text-[8rem] sm:text-[12rem] md:text-[16rem] font-bold text-foreground/[0.02] whitespace-nowrap">
          GHORPAD
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold mb-2">GHORPAD</h3>
            <p className="font-mono text-xs text-gold mb-4">2026 EDITION</p>
            <p className="text-muted text-sm leading-relaxed">
              Ghorpad 2026 — The official student magazine of MILIT. Amplifying
              campus voices.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-xs tracking-widest text-gold mb-4">
              NAVIGATION
            </h4>
            <div className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted text-sm hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="font-mono text-xs tracking-widest text-gold mb-4">
              CONNECT
            </h4>
            <div className="flex gap-3">
              {["Twitter/X", "Instagram", "LinkedIn"].map((social) => (
                <span
                  key={social}
                  className="text-muted text-sm border border-border-subtle px-3 py-1.5 rounded hover:border-gold/50 hover:text-gold transition-all cursor-pointer"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border-subtle pt-6 text-center">
          <p className="font-mono text-[10px] text-muted tracking-widest">
            &copy; {new Date().getFullYear()} GHORPAD 2026 &middot; MILIT -
            DSTSC 08 &middot; ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}
