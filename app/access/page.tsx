"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

export default function AccessGatePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid access code. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,200,74,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,200,74,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Logo area */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2 text-foreground">
            GHORPAD
          </h1>
          <p className="font-mono text-xs text-gold tracking-widest">
            DSTSC-08 &bull; MILIT
          </p>
        </div>

        {/* Access code card */}
        <div className="glass border border-border-subtle rounded-xl p-8">
          <p className="text-sm text-muted mb-6 leading-relaxed">
            This website is restricted to authorised personnel only.
            Enter the access code to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5 text-left">
                ACCESS CODE
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-center tracking-widest font-mono"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
            </div>

            {error && (
              <div className="bg-red-accent/10 border border-red-accent/30 rounded-lg px-4 py-2.5">
                <p className="font-mono text-xs text-red-accent">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gold text-background font-mono text-sm font-semibold py-3 rounded-lg hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                "VERIFYING..."
              ) : (
                <>
                  ENTER SITE
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-center font-mono text-[10px] text-muted mt-6">
            Access code shared via official course channels.
          </p>
        </div>
      </div>
    </div>
  );
}
