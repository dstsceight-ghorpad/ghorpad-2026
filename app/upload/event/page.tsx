"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ImageIcon,
  Clock,
  Shield,
} from "lucide-react";
import { getTransformedUrl, IMAGE_PRESETS } from "@/lib/image-url";

export default function EventUploadPage() {
  const [status, setStatus] = useState<"loading" | "valid" | "expired" | "invalid">("loading");
  const [token, setToken] = useState("");
  const [eventName, setEventName] = useState("Cultural Evening");
  const [category, setCategory] = useState("Cultural");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Extract token and event from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    const evt = params.get("event");
    const cat = params.get("category");

    if (evt) setEventName(decodeURIComponent(evt));
    if (cat) setCategory(decodeURIComponent(cat));

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 15 * 1024 * 1024) {
      setError("File too large (max 15MB)");
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    setFile(f);
    setError(null);
    setSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("photographer", photographer);
      formData.append("event", eventName);
      formData.append("category", category);

      const res = await fetch("/api/upload-event", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setSuccess(true);
      setUploadedCount((c) => c + 1);
      setFile(null);
      setPreview(null);
      setCaption("");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAnother = () => {
    setSuccess(false);
    setFile(null);
    setPreview(null);
    setCaption("");
    setError(null);
    fileRef.current?.click();
  };

  // ── Status screens ──

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-gold animate-spin mx-auto mb-4" />
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

  // ── Main upload page ──

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide">
                GHORPAD 2026
              </h1>
              <p className="font-mono text-[10px] text-gold tracking-widest">
                {eventName.toUpperCase()} PHOTOS
              </p>
            </div>
            {uploadedCount > 0 && (
              <div className="text-right">
                <p className="font-mono text-[10px] text-green-400">
                  {uploadedCount} UPLOADED
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {/* Instructions */}
        <div className="bg-surface border border-border-subtle rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Camera size={18} className="text-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">
                Share Your {eventName} Photos
              </p>
              <p className="font-mono text-[11px] text-muted leading-relaxed">
                Upload your best photos from the event. HD originals are preserved
                for archival. Photos will appear in the GHORPAD gallery.
              </p>
              <p className="font-mono text-[10px] text-muted/60 mt-1">
                JPG, PNG, HEIC &bull; Max 15 MB per photo
              </p>
            </div>
          </div>
        </div>

        {/* Error toast */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            <AlertTriangle size={14} />
            <span className="font-mono text-xs">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Success screen */}
        {success && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2">
              Photo Uploaded!
            </h2>
            <p className="text-sm text-muted mb-6">
              Your photo has been added to the {eventName} gallery.
            </p>
            <button
              onClick={handleUploadAnother}
              className="inline-flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors"
            >
              <Upload size={14} />
              UPLOAD ANOTHER
            </button>
          </div>
        )}

        {/* Upload form */}
        {!success && (
          <div className="space-y-5">
            {/* Photo selection */}
            {!file ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border-subtle hover:border-gold/50 rounded-xl p-12 text-center cursor-pointer transition-all"
              >
                <ImageIcon size={40} className="mx-auto text-muted/30 mb-4" />
                <p className="text-sm font-medium mb-1">
                  Tap to select a photo
                </p>
                <p className="font-mono text-[10px] text-muted">
                  or drag and drop here
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview || ""}
                  alt="Preview"
                  className="w-full max-h-[400px] object-contain rounded-xl border border-border-subtle"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-background/80 text-muted hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-3 left-3 font-mono text-[9px] text-muted bg-background/80 px-2 py-1 rounded">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB &bull; HD Original
                </div>
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                CAPTION (OPTIONAL)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Dance performance by Cariappa Division"
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:border-gold/50 focus:outline-none"
              />
            </div>

            {/* Photographer name */}
            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                YOUR NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                placeholder="e.g. Maj Arjun Singh"
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:border-gold/50 focus:outline-none"
              />
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 bg-gold text-background font-mono text-xs font-semibold py-3.5 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  UPLOADING HD...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  UPLOAD TO {eventName.toUpperCase()} GALLERY
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 mt-8 border-t border-border-subtle">
          <p className="font-mono text-[10px] text-muted/50">
            GHORPAD 2026 &middot; MILIT DSTSC-08 &middot; Event Photo Upload
          </p>
          <p className="font-mono text-[9px] text-muted/30 mt-1">
            HD originals preserved for archival
          </p>
        </footer>
      </div>
    </div>
  );
}
