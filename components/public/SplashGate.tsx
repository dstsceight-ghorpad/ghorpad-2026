"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import InaugurationCeremony from "./InaugurationCeremony";

// Set NEXT_PUBLIC_INAUGURATION_MODE=false on Vercel to disable inauguration.
// Default: inauguration is ON (so it works even if env var is missing).
const INAUGURATION_OFF =
  process.env.NEXT_PUBLIC_INAUGURATION_MODE === "false";

export default function SplashGate() {
  const [mode, setMode] = useState<"loading" | "inauguration" | "splash">(
    "loading"
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // URL param override for testing
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("inauguration");

    if (param === "activate" || param === "deactivate") {
      window.history.replaceState({}, "", window.location.pathname);
      setMode(param === "activate" ? "inauguration" : "splash");
      return;
    }

    // Default: inauguration ON unless explicitly disabled via env var
    setMode(INAUGURATION_OFF ? "splash" : "inauguration");
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
