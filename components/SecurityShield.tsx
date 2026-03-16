"use client";

import { useEffect } from "react";

/**
 * SecurityShield — Global client-side content protection.
 * Blocks right-click, copy, drag, keyboard shortcuts (DevTools, view source, save, print),
 * deters screenshots via visibility blur, and detects DevTools.
 * Renders nothing — purely side-effect based.
 */
export default function SecurityShield() {
  useEffect(() => {
    // ── Right-click block ──
    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // ── Copy/Cut block ──
    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // ── Drag block ──
    const blockDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // ── Keyboard shortcut block ──
    const blockKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // F12 — DevTools
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Ctrl+U — View Source
      if (ctrl && e.key === "u") {
        e.preventDefault();
        return false;
      }

      // Ctrl+S — Save Page
      if (ctrl && e.key === "s") {
        e.preventDefault();
        return false;
      }

      // Ctrl+P — Print
      if (ctrl && e.key === "p") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I — DevTools
      if (ctrl && e.shiftKey && e.key === "I") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J — Console
      if (ctrl && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C — Inspect Element
      if (ctrl && e.shiftKey && e.key === "C") {
        e.preventDefault();
        return false;
      }
    };

    // ── Screenshot deterrence — blur on tab switch ──
    const handleVisibility = () => {
      if (document.hidden) {
        document.body.classList.add("security-blur");
      } else {
        document.body.classList.remove("security-blur");
      }
    };

    // ── DevTools detection via console.log image trick ──
    let devtoolsCheckInterval: ReturnType<typeof setInterval>;

    const startDevtoolsDetection = () => {
      const threshold = 160;
      devtoolsCheckInterval = setInterval(() => {
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;
        if (widthDiff || heightDiff) {
          document.body.classList.add("security-blur");
        } else if (!document.hidden) {
          document.body.classList.remove("security-blur");
        }
      }, 1000);
    };

    // ── Disable image interactions globally ──
    const protectImages = () => {
      document.querySelectorAll("img").forEach((img) => {
        img.setAttribute("draggable", "false");
        img.addEventListener("contextmenu", blockContext);
      });
    };

    // Observe DOM for new images
    const observer = new MutationObserver(() => {
      protectImages();
    });

    // ── Attach all listeners ──
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("visibilitychange", handleVisibility);

    protectImages();
    startDevtoolsDetection();

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // ── Cleanup ──
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(devtoolsCheckInterval);
      observer.disconnect();
      document.body.classList.remove("security-blur");
    };
  }, []);

  return null;
}
