"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  User,
  Check,
  Search,
  Shield,
  Clock,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import { samplePersonnel } from "@/lib/sample-data";
import { resizeAndConvertToBase64, getDisplayName } from "@/lib/personnel";
import type { Division, Personnel } from "@/types";

const DIVISIONS: Division[] = ["Manekshaw", "Cariappa", "Arjan", "Pereira"];

// Only student officers
const studentOfficers = samplePersonnel.filter(
  (p) => p.personnel_role === "student_officer"
);

export default function PhotoUploadPage() {
  const [status, setStatus] = useState<
    "loading" | "valid" | "expired" | "invalid"
  >("loading");
  const [token, setToken] = useState("");
  const [uploadedIds, setUploadedIds] = useState<Set<string>>(new Set());
  const [activeDivision, setActiveDivision] = useState<Division>("Manekshaw");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingPersonId = useRef<string | null>(null);

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setStatus("invalid");
      return;
    }
    setToken(t);

    // Validate token via API
    fetch(`/api/validate-upload-token?token=${encodeURIComponent(t)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setStatus("valid");
          setUploadedIds(new Set(data.uploadedIds || []));
        } else if (data.expired) {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, []);

  // Handle upload for a specific person
  const handleUploadClick = useCallback((personId: string) => {
    pendingPersonId.current = personId;
    fileRef.current?.click();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const personId = pendingPersonId.current;
    if (!file || !personId) return;

    setUploadingId(personId);
    setErrorMsg(null);
    setSuccessId(null);

    try {
      // Client-side optimize to 800x1000 JPEG (high-res for enlarged views)
      const dataUrl = await resizeAndConvertToBase64(file, 800, 1000, 0.82);

      // Upload via API
      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          personnelId: personId,
          imageData: dataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Mark as uploaded
      setUploadedIds((prev) => new Set([...prev, personId]));
      setSuccessId(personId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Upload failed. Try again."
      );
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setUploadingId(null);
      pendingPersonId.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Filter personnel
  const filtered = studentOfficers
    .filter((p) => p.division === activeDivision)
    .filter((p) =>
      searchQuery
        ? getDisplayName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.service || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true
    );

  const totalSOs = studentOfficers.length;
  const uploadedCount = uploadedIds.size;
  const divisionCounts = DIVISIONS.map((d) => ({
    division: d,
    total: studentOfficers.filter((p) => p.division === d).length,
    uploaded: studentOfficers.filter(
      (p) => p.division === d && uploadedIds.has(p.id)
    ).length,
  }));

  // ─── Invalid / Expired states ────────────────────────────────
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
            This link is invalid. Please contact the editorial team for a valid
            upload link.
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
            This upload link has expired. Please contact the editorial team for
            a new link.
          </p>
        </div>
      </div>
    );
  }

  // ─── Main upload page ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide">
                GHORPAD 2026
              </h1>
              <p className="font-mono text-[10px] text-gold tracking-widest">
                PHOTO UPLOAD PORTAL
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-muted">
                {uploadedCount} / {totalSOs} UPLOADED
              </p>
              <div className="w-24 h-1.5 bg-surface-light rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{
                    width: `${totalSOs > 0 ? Math.round((uploadedCount / totalSOs) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Instructions */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
        <div className="bg-surface border border-border-subtle rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Camera size={18} className="text-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">
                Upload Your Photograph
              </p>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                Please upload the photograph clicked at Ante room for GHORPAD
                Magazine.
              </p>
              <p className="font-mono text-[11px] text-muted leading-relaxed mt-1">
                Find your name below, tap{" "}
                <span className="text-gold">UPLOAD</span>, and select your
                photo (JPEG or PNG). Photos are auto-optimized.
              </p>
            </div>
          </div>
        </div>

        {/* Error toast */}
        {errorMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
            <AlertTriangle size={14} />
            <span className="font-mono text-xs">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Division tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {divisionCounts.map(({ division, total, uploaded }) => (
            <button
              key={division}
              onClick={() => setActiveDivision(division)}
              className={`font-mono text-[10px] px-3 py-2 rounded-lg transition-all ${
                activeDivision === division
                  ? "bg-gold text-background font-semibold"
                  : "bg-surface border border-border-subtle text-muted hover:border-gold/40 hover:text-gold"
              }`}
            >
              {division.toUpperCase()}
              <span className="ml-1.5 opacity-70">
                {uploaded}/{total}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or unit..."
            className="w-full bg-surface border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-gold/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Personnel grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((person) => {
            const isUploaded = uploadedIds.has(person.id);
            const isUploading = uploadingId === person.id;
            const justUploaded = successId === person.id;

            return (
              <div
                key={person.id}
                className={`bg-surface border rounded-lg overflow-hidden transition-all ${
                  justUploaded
                    ? "border-green-500/50 ring-1 ring-green-500/20"
                    : isUploaded
                      ? "border-green-500/20"
                      : "border-border-subtle hover:border-gold/30"
                }`}
              >
                {/* Avatar area */}
                <div className="aspect-[4/5] bg-surface-light relative flex items-center justify-center overflow-hidden">
                  {isUploaded ? (
                    <div className="w-full h-full flex items-center justify-center bg-green-500/5">
                      <div className="text-center">
                        <Check
                          size={32}
                          className="mx-auto text-green-400 mb-1"
                        />
                        <span className="font-mono text-[9px] text-green-400">
                          UPLOADED
                        </span>
                      </div>
                    </div>
                  ) : isUploading ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="font-mono text-[9px] text-muted">
                        UPLOADING...
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <User size={32} className="mx-auto text-muted/20 mb-2" />
                      <span className="font-mono text-[9px] text-muted/40">
                        NO PHOTO
                      </span>
                    </div>
                  )}
                </div>

                {/* Info + Upload button */}
                <div className="p-2.5">
                  <h4 className="text-xs font-semibold mb-0.5 truncate">
                    {getDisplayName(person)}
                  </h4>
                  <p className="font-mono text-[9px] text-muted truncate">
                    {person.designation}
                  </p>

                  {!isUploading && (
                    <button
                      onClick={() => handleUploadClick(person.id)}
                      className={`flex items-center justify-center gap-1.5 w-full mt-2 font-mono text-[10px] font-semibold px-3 py-2 rounded transition-all ${
                        isUploaded
                          ? "border border-green-500/30 text-green-400 hover:bg-green-500/10"
                          : "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
                      }`}
                    >
                      <Upload size={10} />
                      {isUploaded ? "RE-UPLOAD" : "UPLOAD PHOTO"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search size={32} className="mx-auto text-muted/20 mb-3" />
            <p className="font-mono text-xs text-muted">
              No matching officers found.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 mt-8 border-t border-border-subtle">
          <p className="font-mono text-[10px] text-muted/50">
            GHORPAD 2026 &middot; MILIT DSTSC-08 &middot; Secure Upload Portal
          </p>
          <p className="font-mono text-[9px] text-muted/30 mt-1">
            This link expires on 02 Apr 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
