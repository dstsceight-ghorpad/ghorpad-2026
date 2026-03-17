"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import InaugurationCeremony from "./InaugurationCeremony";

const STORAGE_KEY = "ghorpad_inauguration_active";

export default function SplashGate() {
  const [mode, setMode] = useState<"loading" | "inauguration" | "splash">(
    "loading"
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check URL params for activation/deactivation
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("inauguration");

    if (param === "activate") {
      localStorage.setItem(STORAGE_KEY, "true");
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
      setMode("inauguration");
      return;
    }
    if (param === "deactivate") {
      localStorage.removeItem(STORAGE_KEY);
      window.history.replaceState({}, "", window.location.pathname);
      setMode("splash");
      return;
    }

    // Check localStorage
    const active = localStorage.getItem(STORAGE_KEY);
    setMode(active === "true" ? "inauguration" : "splash");
  }, []);

  if (dismissed || mode === "loading") {
    if (mode === "loading") {
      // Brief blank screen while checking localStorage
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
