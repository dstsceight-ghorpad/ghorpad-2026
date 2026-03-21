"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import InaugurationCeremony from "./InaugurationCeremony";

// Build-time fallback — used only if the API call fails
const INAUGURATION_ENV =
  process.env.NEXT_PUBLIC_INAUGURATION_MODE === "true";

export default function SplashGate() {
  const [mode, setMode] = useState<"loading" | "inauguration" | "splash">(
    "loading"
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // URL param override for testing (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("inauguration");

    if (param === "activate" || param === "deactivate") {
      window.history.replaceState({}, "", window.location.pathname);
      setMode(param === "activate" ? "inauguration" : "splash");
      return;
    }

    // Fetch runtime setting from database
    fetch("/api/settings?key=inauguration_mode")
      .then((res) => res.json())
      .then((data) => {
        setMode(data.value === "true" ? "inauguration" : "splash");
      })
      .catch(() => {
        // Fallback to env var if API fails
        setMode(INAUGURATION_ENV ? "inauguration" : "splash");
      });
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
