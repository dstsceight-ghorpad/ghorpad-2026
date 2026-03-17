"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import InaugurationCeremony from "./InaugurationCeremony";

// Global toggle — set NEXT_PUBLIC_INAUGURATION_MODE=true in .env.local / Vercel env vars
// When true, ALL visitors see the inauguration animation after the access code
const INAUGURATION_ENV =
  process.env.NEXT_PUBLIC_INAUGURATION_MODE === "true";

export default function SplashGate() {
  const [mode, setMode] = useState<"loading" | "inauguration" | "splash">(
    "loading"
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // URL params override for testing (per-device)
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("inauguration");

    if (param === "activate" || param === "deactivate") {
      window.history.replaceState({}, "", window.location.pathname);
      setMode(param === "activate" ? "inauguration" : "splash");
      return;
    }

    // Use env var as global toggle for all visitors
    setMode(INAUGURATION_ENV ? "inauguration" : "splash");
  }, []);

  if (dismissed || mode === "loading") {
    if (mode === "loading") {
      return (
        <div
          className="fixed inset-0 z-[100]"
          style={{ backgroundColor: "#060604" }}
        />
      );
    }
    return null;
  }

  if (mode === "inauguration") {
    return <InaugurationCeremony onComplete={() => setDismissed(true)} />;
  }

  return <SplashScreen />;
}
