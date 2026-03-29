"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Camera,
  User,
  Upload,
  SkipForward,
  Check,
  ChevronLeft,
  Search,
} from "lucide-react";
import { useUser } from "../../layout";
import { canPublish } from "@/lib/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getPhotoStatus, getNextWithoutPhoto } from "@/lib/photo-campaign";
import { optimizeImage, AVATAR_PRESET } from "@/lib/image-optimize";
import type { Personnel } from "@/types";
import Link from "next/link";

type ViewMode = "grid" | "capture";
type FilterTab = "missing" | "has_photo" | "all";

export default function PhotoCampaignPage() {
  const { profile } = useUser();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterTab, setFilterTab] = useState<FilterTab>("missing");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPerson, setCurrentPerson] = useState<Personnel | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canEdit = profile?.role ? canPublish(profile.role) : false;

  const loadData = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("personnel")
      .select("*")
      .order("personnel_role", { ascending: true })
      .order("sort_order", { ascending: true });
    if (data) {
      setPersonnel(data.map((p: Record<string, unknown>) => ({ ...p, order: p.sort_order })) as Personnel[]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const status = getPhotoStatus(personnel);

  const filtered = personnel
    .filter((p) => {
      if (filterTab === "missing") return !p.avatar_url;
      if (filterTab === "has_photo") return !!p.avatar_url;
      return true;
    })
    .filter((p) =>
      searchQuery
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.designation.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const handleStartCapture = (person?: Personnel) => {
    const target = person || getNextWithoutPhoto(personnel);
    if (target) {
      setCurrentPerson(target);
      setViewMode("capture");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentPerson) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await optimizeImage(file, AVATAR_PRESET);
      // Upload to Supabase storage for persistence
      let avatarUrl = result.dataUrl;
      try {
        const res = await fetch("/api/upload-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personnelId: currentPerson.id,
            imageData: result.dataUrl,
            editorial: true,
          }),
        });
        if (res.ok) {
          const { url } = await res.json();
          avatarUrl = url;
        }
      } catch {
        // Fallback to localStorage-only
      }
      // Save to Supabase
      const supabase = createBrowserSupabaseClient();
      await supabase.from("personnel").update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq("id", currentPerson.id);
      await loadData();

      // Auto-advance to next
      const updated = personnel;
      const next = getNextWithoutPhoto(updated, currentPerson.id);
      if (next) {
        setCurrentPerson(next);
      } else {
        setViewMode("grid");
        setCurrentPerson(null);
      }
    } catch {
      // silently fail
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSkip = () => {
    if (!currentPerson) return;
    const next = getNextWithoutPhoto(personnel, currentPerson.id);
    if (next) {
      setCurrentPerson(next);
    } else {
      setViewMode("grid");
      setCurrentPerson(null);
    }
  };

  // Quick-capture mode
  if (viewMode === "capture" && currentPerson) {
    const missingCount = personnel.filter((p) => !p.avatar_url).length;
    const capturedSoFar = status.withPhoto;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => {
            setViewMode("grid");
            setCurrentPerson(null);
          }}
          className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft size={14} />
          BACK TO GRID
        </button>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-muted">
              QUICK CAPTURE MODE
            </span>
            <span className="font-mono text-[10px] text-gold">
              {capturedSoFar} / {status.total} collected &middot;{" "}
              {missingCount} remaining
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-light rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${status.percentage}%` }}
            />
          </div>
        </div>

        {/* Person card */}
        <div className="bg-surface border border-border-subtle rounded-xl p-8 text-center">
          <div className="w-32 h-32 rounded-xl bg-surface-light border border-border-subtle flex items-center justify-center overflow-hidden mx-auto mb-6">
            {currentPerson.avatar_url ? (
              <img
                src={currentPerson.avatar_url}
                alt={currentPerson.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-muted/20" />
            )}
          </div>

          <h2 className="font-serif text-xl font-bold mb-1">
            {currentPerson.name}
          </h2>
          <p className="font-mono text-xs text-muted mb-1">
            {currentPerson.designation}
          </p>
          <div className="mb-6" />

          {/* Upload zone */}
          <div
            className="border-2 border-dashed border-border-subtle rounded-xl p-8 mb-6 hover:border-gold/40 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-xs text-muted">
                  OPTIMIZING...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Camera size={32} className="text-muted/40" />
                <span className="font-mono text-xs text-muted">
                  CLICK TO UPLOAD PHOTO
                </span>
                <span className="font-mono text-[10px] text-muted/60">
                  JPG/PNG &middot; Auto-optimized to 400x500px
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 font-mono text-xs px-6 py-2.5 border border-border-subtle text-muted rounded-lg hover:border-gold/50 hover:text-gold transition-all"
            >
              <SkipForward size={14} />
              SKIP
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid mode
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Camera size={20} className="text-gold" />
            <h1 className="font-serif text-2xl font-bold">Photo Campaign</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/editorial/personnel"
              className="font-mono text-[10px] text-muted hover:text-foreground transition-colors"
            >
              &larr; PERSONNEL
            </Link>
            {canEdit && status.withoutPhoto > 0 && (
              <button
                onClick={() => handleStartCapture()}
                className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
              >
                <Camera size={14} />
                QUICK CAPTURE
              </button>
            )}
          </div>
        </div>
        <p className="font-mono text-xs text-muted">
          // COLLECT PHOTOS FOR ALL PERSONNEL
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-surface border border-border-subtle rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-foreground">
            {status.withPhoto} of {status.total} photos collected
          </span>
          <span className="font-mono text-xs text-gold font-semibold">
            {status.percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all"
            style={{ width: `${status.percentage}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-mono text-[10px] text-green-400">
            {status.withPhoto} collected
          </span>
          <span className="font-mono text-[10px] text-red-400">
            {status.withoutPhoto} missing
          </span>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "missing", label: "MISSING PHOTOS" },
              { key: "has_photo", label: "HAS PHOTO" },
              { key: "all", label: "ALL" },
            ] as { key: FilterTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`font-mono text-[10px] px-3 py-1.5 rounded transition-all ${
                filterTab === tab.key
                  ? "bg-gold text-background"
                  : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full sm:w-64 bg-surface-light border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-xs focus:border-gold/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((person) => (
          <div
            key={person.id}
            className="bg-surface border border-border-subtle rounded-lg overflow-hidden hover:border-gold/20 transition-all"
          >
            <div className="aspect-square bg-surface-light relative flex items-center justify-center overflow-hidden">
              {person.avatar_url ? (
                <img
                  src={person.avatar_url}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={28} className="text-muted/20" />
              )}
              {!person.avatar_url && (
                <div className="absolute top-2 left-2">
                  <span className="font-mono text-[8px] bg-red-500/80 text-white px-1.5 py-0.5 rounded">
                    MISSING
                  </span>
                </div>
              )}
              {person.avatar_url && (
                <div className="absolute top-2 left-2">
                  <Check size={14} className="text-green-400 bg-background/80 rounded-full p-0.5" />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <h4 className="text-xs font-semibold mb-0.5 truncate">
                {person.name}
              </h4>
              <p className="font-mono text-[9px] text-muted truncate">
                {person.designation}
              </p>
              {canEdit && !person.avatar_url && (
                <button
                  onClick={() => handleStartCapture(person)}
                  className="flex items-center gap-1 font-mono text-[9px] text-gold/70 hover:text-gold mt-1.5 transition-colors"
                >
                  <Upload size={10} />
                  UPLOAD
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Camera size={32} className="mx-auto text-muted/20 mb-3" />
          <p className="font-mono text-xs text-muted">
            No personnel match your filter.
          </p>
        </div>
      )}
    </div>
  );
}
