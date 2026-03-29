"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Search,
  Pencil,
  X,
  Upload,
  Trash2,
  Save,
  Cake,
  Heart,
  CalendarDays,
  Users2,
  Camera,
} from "lucide-react";
import { useUser } from "../layout";
import { canPublish } from "@/lib/auth";
import {
  resizeAndConvertToBase64,
  getDisplayName,
} from "@/lib/personnel";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Personnel, PersonnelRole } from "@/types";

type FilterTab = "all" | "leadership" | "staff" | "student";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "leadership", label: "COMMANDANT & DEPUTY" },
  { key: "staff", label: "STAFF OFFICERS" },
  { key: "student", label: "STUDENT OFFICERS" },
];

function matchesFilter(role: PersonnelRole, tab: FilterTab): boolean {
  if (tab === "all") return true;
  if (tab === "leadership")
    return role === "commandant" || role === "deputy_commandant";
  if (tab === "staff") return role === "staff_officer";
  if (tab === "student") return role === "student_officer";
  return true;
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({
  person,
  onSave,
  onClose,
}: {
  person: Personnel;
  onSave: (id: string, updates: Partial<Personnel>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: person.name,
    rank: person.rank,
    designation: person.designation,
    service: person.service || "",
    bio: person.bio || "",
    birthday: person.birthday || "",
    spouse_name: person.spouse_name || "",
    spouse_birthday: person.spouse_birthday || "",
    anniversary: person.anniversary || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    person.avatar_url
  );
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await resizeAndConvertToBase64(file);
      setAvatarPreview(base64);
      setAvatarBase64(base64);
    } catch {
      // silently fail
    }
    setUploading(false);
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Delete this profile photo? This cannot be undone.")) return;
    try {
      const supabase = (await import("@/lib/supabase")).createBrowserSupabaseClient();
      await supabase.storage
        .from("personnel-photos")
        .remove([`${person.id}.jpg`]);
      setAvatarPreview(null);
      setAvatarBase64(null);
    } catch {
      alert("Failed to delete photo");
    }
  };

  const handleSave = () => {
    const updates: Partial<Personnel> = {};
    if (form.name !== person.name) updates.name = form.name;
    if (form.rank !== person.rank) updates.rank = form.rank;
    if (form.designation !== person.designation)
      updates.designation = form.designation;
    if (form.service !== (person.service || ""))
      updates.service = form.service || undefined;
    if (form.bio !== (person.bio || ""))
      updates.bio = form.bio || undefined;
    if (form.birthday !== (person.birthday || ""))
      updates.birthday = form.birthday || undefined;
    if (form.spouse_name !== (person.spouse_name || ""))
      updates.spouse_name = form.spouse_name || undefined;
    if (form.spouse_birthday !== (person.spouse_birthday || ""))
      updates.spouse_birthday = form.spouse_birthday || undefined;
    if (form.anniversary !== (person.anniversary || ""))
      updates.anniversary = form.anniversary || undefined;
    if (avatarBase64) updates.avatar_url = avatarBase64;

    onSave(person.id, updates);
    onClose();
  };

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-subtle rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div>
            <h3 className="font-serif text-lg font-bold">Edit Profile</h3>
            <p className="font-mono text-[10px] text-muted mt-0.5">
              {person.personnel_role.replace(/_/g, " ").toUpperCase()} &middot;{" "}
              {person.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Photo upload area */}
          <div className="flex items-center gap-5">
            <div
              className="w-24 h-24 rounded-lg bg-surface-light border border-border-subtle flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-gold/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-muted/30" />
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 font-mono text-xs px-4 py-2 border border-gold/50 text-gold rounded hover:bg-gold hover:text-background transition-all disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading ? "PROCESSING..." : "UPLOAD PHOTO"}
              </button>
              {avatarPreview && (
                <button
                  onClick={handleDeletePhoto}
                  className="flex items-center gap-2 font-mono text-xs px-4 py-2 border border-red-500/50 text-red-400 rounded hover:bg-red-500/10 transition-all mt-1.5"
                >
                  <Trash2 size={14} />
                  DELETE PHOTO
                </button>
              )}
              <p className="font-mono text-[10px] text-muted mt-1">
                JPG/PNG, max 2MB. Will be resized.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          {/* Core fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <FieldInput
              label="Rank"
              value={form.rank}
              onChange={(v) => setForm({ ...form, rank: v })}
            />
            <FieldInput
              label="Designation"
              value={form.designation}
              onChange={(v) => setForm({ ...form, designation: v })}
            />
            <div>
              <label className="font-mono text-[10px] text-muted mb-1 block uppercase">Service</label>
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full bg-surface-light border border-border-subtle rounded px-3 py-2 text-sm focus:border-gold/50 focus:outline-none"
              >
                <option value="">Select Service</option>
                <option value="Indian Army">Indian Army</option>
                <option value="Indian Navy">Indian Navy</option>
                <option value="Indian Air Force">Indian Air Force</option>
                <option value="Indian Coast Guard">Indian Coast Guard</option>
              </select>
            </div>
          </div>

          {/* Extended fields */}
          <div className="border-t border-border-subtle pt-4">
            <span className="font-mono text-xs text-gold tracking-widest mb-3 block">
              // PERSONAL DETAILS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Birthday"
                value={form.birthday}
                onChange={(v) => setForm({ ...form, birthday: v })}
                placeholder="e.g. 22 Nov"
                icon={Cake}
              />
              <FieldInput
                label="Spouse Name"
                value={form.spouse_name}
                onChange={(v) => setForm({ ...form, spouse_name: v })}
                placeholder="e.g. Mrs Priya Pandey"
                icon={Heart}
              />
              <FieldInput
                label="Spouse Birthday"
                value={form.spouse_birthday}
                onChange={(v) => setForm({ ...form, spouse_birthday: v })}
                placeholder="e.g. 17 Jul"
                icon={Cake}
              />
              <FieldInput
                label="Anniversary"
                value={form.anniversary}
                onChange={(v) => setForm({ ...form, anniversary: v })}
                placeholder="e.g. 24 November"
                icon={CalendarDays}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="font-mono text-[10px] text-muted mb-1.5 block uppercase">
              Bio / About
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              placeholder="A brief write-up about the officer..."
              className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/50 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="font-mono text-xs px-5 py-2 text-muted hover:text-foreground transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 font-mono text-xs px-5 py-2 bg-gold text-background rounded hover:bg-gold/90 transition-colors"
          >
            <Save size={14} />
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable input field ────────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] text-muted mb-1.5 block uppercase">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-surface-light border border-border-subtle rounded-lg py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/50 focus:outline-none transition-colors ${
            Icon ? "pl-9 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function PersonnelPage() {
  const { profile, loading } = useUser();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);

  const canEdit = profile?.role ? canPublish(profile.role) : false;

  // Load personnel via API (uses service role for reliable access)
  const refreshPersonnel = useCallback(async () => {
    try {
      const res = await fetch("/api/personnel");
      if (res.ok) {
        const data = await res.json();
        setPersonnel(data.map((p: Record<string, unknown>) => ({ ...p, order: p.sort_order })) as Personnel[]);
      }
    } catch (err) {
      console.error("Failed to load personnel:", err);
    }
  }, []);

  useEffect(() => {
    refreshPersonnel();
  }, [refreshPersonnel]);

  const handleSave = async (id: string, updates: Partial<Personnel>) => {
    // If a photo was uploaded (base64), push it to Supabase storage first
    if (updates.avatar_url && updates.avatar_url.startsWith("data:image")) {
      try {
        const res = await fetch("/api/upload-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personnelId: id,
            imageData: updates.avatar_url,
            editorial: true,
          }),
        });
        if (res.ok) {
          const { url } = await res.json();
          updates.avatar_url = url;
        }
      } catch {
        // Photo upload failed, skip avatar update
        delete updates.avatar_url;
      }
    }

    // Save via API (uses service role to bypass RLS)
    const dbUpdates: Record<string, unknown> = { ...updates };
    // Map 'order' back to 'sort_order' for DB
    if ('order' in dbUpdates) {
      dbUpdates.sort_order = dbUpdates.order;
      delete dbUpdates.order;
    }

    try {
      const res = await fetch("/api/personnel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: dbUpdates }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Failed to save: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to save: " + (err instanceof Error ? err.message : "Network error"));
    }
    refreshPersonnel();
  };

  // Filter + search
  const filtered = personnel
    .filter((p) => matchesFilter(p.personnel_role, activeTab))
    .filter((p) =>
      searchQuery
        ? getDisplayName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.service || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      // Sort by role priority then order
      const rolePriority: Record<PersonnelRole, number> = {
        commandant: 0,
        deputy_commandant: 1,
        staff_officer: 2,
        student_officer: 3,
      };
      const rDiff = rolePriority[a.personnel_role] - rolePriority[b.personnel_role];
      if (rDiff !== 0) return rDiff;
      return a.order - b.order;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Users2 size={20} className="text-gold" />
            <h1 className="font-serif text-2xl font-bold">
              Personnel Directory
            </h1>
          </div>
          {canEdit && (
            <a
              href="/editorial/personnel/photos"
              className="flex items-center gap-2 bg-surface border border-border-subtle font-mono text-[10px] px-3 py-2 rounded-lg hover:border-gold/50 hover:text-gold transition-all"
            >
              <Camera size={14} />
              PHOTO CAMPAIGN
            </a>
          )}
        </div>
        <p className="font-mono text-xs text-muted">
          // MANAGE OFFICERS & PROFILES &middot; {personnel.length} personnel
        </p>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-mono text-[10px] px-3 py-1.5 rounded transition-all ${
                activeTab === tab.key
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
            placeholder="Search by name, designation..."
            className="w-full sm:w-64 bg-surface-light border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted/40 focus:border-gold/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="font-mono text-[10px] text-muted mb-4">
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((person) => (
          <div
            key={person.id}
            className="bg-surface border border-border-subtle rounded-lg overflow-hidden hover:border-gold/20 transition-all group"
          >
            {/* Mini avatar */}
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
              {/* Rank badge */}
              <div className="absolute top-2 left-2">
                <span className="font-mono text-[9px] bg-gold text-background px-1.5 py-0.5 rounded">
                  {person.rank.toUpperCase()}
                </span>
              </div>
              {/* Role tag */}
              <div className="absolute top-2 right-2">
                <span className="font-mono text-[8px] bg-background/80 text-muted px-1.5 py-0.5 rounded">
                  {person.personnel_role === "commandant"
                    ? "CMD"
                    : person.personnel_role === "deputy_commandant"
                      ? "DEP CMD"
                      : person.personnel_role === "staff_officer"
                        ? "STAFF"
                        : "SO"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h4 className="font-serif text-sm font-semibold mb-0.5 leading-snug">
                {getDisplayName(person)}
              </h4>
              <p className="font-mono text-[10px] text-muted mb-1">
                {person.designation}
              </p>
              {/* Edit button */}
              {canEdit && (
                <button
                  onClick={() => setEditingPerson(person)}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-gold/70 hover:text-gold mt-2 transition-colors"
                >
                  <Pencil size={11} />
                  EDIT
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <User size={32} className="mx-auto text-muted/20 mb-3" />
          <p className="font-mono text-xs text-muted">
            No personnel match your search.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingPerson && (
        <EditModal
          person={editingPerson}
          onSave={handleSave}
          onClose={() => setEditingPerson(null)}
        />
      )}
    </div>
  );
}
