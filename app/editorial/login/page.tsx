"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  isDemoMode,
  DEMO_CREDENTIALS,
  setDemoSession,
} from "@/lib/demo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const demoMode = isDemoMode();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Demo mode — check against hardcoded credentials
    if (demoMode) {
      if (
        email === DEMO_CREDENTIALS.email &&
        password === DEMO_CREDENTIALS.password
      ) {
        setDemoSession();
        router.push("/editorial/dashboard");
      } else {
        setError(
          `Demo mode: Use ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`
        );
      }
      setLoading(false);
      return;
    }

    // Real Supabase auth
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        router.push("/editorial/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
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

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold mb-1">GHORPAD</h1>
          <p className="font-mono text-xs text-gold tracking-widest">
            EDITORIAL HQ
          </p>
        </div>

        {/* Demo mode banner */}
        {demoMode && (
          <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 mb-4 text-center">
            <p className="font-mono text-xs text-gold mb-1">DEMO MODE ACTIVE</p>
            <p className="font-mono text-[10px] text-muted">
              Email: <span className="text-foreground">{DEMO_CREDENTIALS.email}</span>
              {" · "}
              Password: <span className="text-foreground">{DEMO_CREDENTIALS.password}</span>
            </p>
          </div>
        )}

        {/* Login card */}
        <div className="glass border border-border-subtle rounded-xl p-8">
          <h2 className="font-mono text-sm text-center text-muted mb-6 tracking-wider">
            SIGN IN TO EDITORIAL
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                placeholder="editor@ghorpad.in"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
            </div>

            {error && (
              <div className="bg-red-accent/10 border border-red-accent/30 rounded-lg px-4 py-2.5">
                <p className="font-mono text-xs text-red-accent">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-background font-mono text-sm font-semibold py-3 rounded-lg hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN TO EDITORIAL"}
            </button>
          </form>

          <p className="text-center font-mono text-[10px] text-muted mt-6">
            {demoMode
              ? "Supabase not configured. Running in demo mode."
              : "Access restricted to editorial team members only."}
          </p>
        </div>
      </div>
    </div>
  );
}
