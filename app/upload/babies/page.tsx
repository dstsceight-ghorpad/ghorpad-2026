"use client";

import { useState, useEffect, useRef } from "react";
import {
  Baby,
  Camera,
  Check,
  Shield,
  Clock,
  Upload,
  X,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { resizeAndConvertToBase64 } from "@/lib/personnel";
import type { Division } from "@/types";

const DIVISIONS: Division[] = ["Manekshaw", "Cariappa", "Arjan", "Pereira"];

export default function BabyUploadPage() {
  const [status, setStatus] = useState<"loading" | "valid" | "expired" | "invalid">("loading");
  const [token, setToken] = useState("");
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [division, setDivision] = useState<Division | "">("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Validate token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setStatus("invalid");
      return;
    }
    setToken(t);

    fetch(`/api/validate-upload-token?token=${encodeURIComponent(t)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) setStatus("valid");
        else if (data.expired) setStatus("expired");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await resizeAndConvertToBase64(file, 1200, 1500, 0.85);
      setImageData(dataUrl);
      setPreview(dataUrl);
    } catch {
      setErrorMsg("Failed to process image. Try another photo.");
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!imageData || !childName.trim() || !parentName.trim() || uploading) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/upload-baby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          childName: childName.trim(),
          parentName: parentName.trim(),
          division: division || undefined,
          imageData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(true);
      setUploadCount((c) => c + 1);

      // Reset for next upload after delay
      setTimeout(() => {
        setSuccess(false);
        setChildName("");
        setPreview(null);
        setImageData(null);
      }, 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    setImageData(null);
  };

  // ── Status screens ──
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-muted">VERIFYING ACCESS...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Shield size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">Access Denied</h1>
          <p className="font-mono text-xs text-muted">
            This link is invalid. Please contact the editorial team for a valid upload link.
          </p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Clock size={48} className="mx-auto text-amber-400 mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">Link Expired</h1>
          <p className="font-mono text-xs text-muted">
            This upload link has expired. Please contact the editorial team for a new link.
          </p>
        </div>
      </div>
    );
  }

  // ── Main upload form ──
  return (
    <div className="min-h-screen bg-background">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold tracking-wide">GHORPAD 2026</h1>
            <p className="font-mono text-[10px] text-pink-400 tracking-widest">
              MILIT BABIES UPLOAD
            </p>
          </div>
          {uploadCount > 0 && (
            <div className="font-mono text-[10px] text-green-400">
              {uploadCount} UPLOADED ✓
            </div>
          )}
        </div>
      </header>

      {/* Error toast */}
      {errorMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
          <AlertTriangle size={14} />
          <span className="font-mono text-xs">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}><X size={14} /></button>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        {/* Instructions */}
        <div className="bg-surface border border-border-subtle rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Baby size={18} className="text-pink-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Upload Your Little One&apos;s Photo</p>
              <p className="font-mono text-[11px] text-muted leading-relaxed">
                Share your child&apos;s photo for the <span className="text-pink-400">MILIT Babies</span> section
                of GHORPAD 2026 magazine. Photos go directly to the gallery!
              </p>
            </div>
          </div>
        </div>

        {/* Success state */}
        {success ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Heart size={36} className="text-pink-400 fill-pink-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2">Photo Uploaded!</h2>
            <p className="text-sm text-muted mb-1">
              Your baby&apos;s photo is now in the MILIT Babies gallery.
            </p>
            <p className="font-mono text-[10px] text-muted">
              You can upload more photos in a moment...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Photo upload area */}
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                BABY&apos;S PHOTO *
              </label>
              {!preview ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-[3/4] max-h-[400px] rounded-xl border-2 border-dashed border-border-subtle hover:border-pink-400/50 transition-all flex flex-col items-center justify-center gap-3 bg-surface"
                >
                  <Camera size={36} className="text-muted/30" />
                  <div className="text-center">
                    <span className="text-sm font-medium block">Tap to select photo</span>
                    <span className="font-mono text-[10px] text-muted mt-1 block">
                      JPEG, PNG &bull; Auto-optimized
                    </span>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-[400px] object-contain rounded-xl border border-border-subtle bg-surface"
                  />
                  <button
                    onClick={clearPhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Child's name */}
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                CHILD&apos;S NAME *
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Baby Arjun"
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:border-pink-400/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Parent's name */}
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                PARENT&apos;S NAME (SON/DAUGHTER OF) *
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Son of Maj Rajesh Kumar"
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:border-pink-400/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Division */}
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                DIVISION
              </label>
              <div className="flex flex-wrap gap-2">
                {DIVISIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDivision(division === d ? "" : d)}
                    className={`font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all ${
                      division === d
                        ? "bg-pink-500 text-white"
                        : "bg-surface border border-border-subtle text-muted hover:border-pink-400/40"
                    }`}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!imageData || !childName.trim() || !parentName.trim() || uploading}
              className={`w-full flex items-center justify-center gap-2 font-mono text-xs font-semibold py-3.5 rounded-xl transition-all ${
                imageData && childName.trim() && parentName.trim() && !uploading
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "bg-surface border border-border-subtle text-muted cursor-not-allowed"
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  UPLOADING...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  UPLOAD TO MILIT BABIES
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 mt-8 border-t border-border-subtle">
          <p className="font-mono text-[10px] text-muted/50">
            GHORPAD 2026 &middot; MILIT DSTSC-08 &middot; Secure Upload Portal
          </p>
        </footer>
      </div>
    </div>
  );
}
