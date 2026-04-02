"use client";

import { useState, useEffect, useRef } from "react";
import { UserCircle, Upload, Save, Check, Loader2, Twitter, Linkedin, Instagram } from "lucide-react";
import { useUser } from "../layout";
import {
  loadAuthorProfile,
  saveAuthorProfile,
} from "@/lib/author-profile";
import { optimizeImage, AVATAR_PRESET } from "@/lib/image-optimize";
import { DIVISIONS } from "@/types";
import type { AuthorProfile } from "@/types";

export default function ProfilePage() {
  const { profile } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [fullBio, setFullBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [batch, setBatch] = useState("");
  const [division, setDivision] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing profile from Supabase
  useEffect(() => {
    if (!profile?.id) return;
    loadAuthorProfile(profile.id).then((existing) => {
      if (existing) {
        setDisplayName(existing.display_name);
        setShortBio(existing.short_bio);
        setFullBio(existing.full_bio);
        setAvatarUrl(existing.avatar_url);
        setBatch(existing.batch);
        setDivision(existing.division);
        setTwitter(existing.social_links?.twitter || "");
        setLinkedin(existing.social_links?.linkedin || "");
        setInstagram(existing.social_links?.instagram || "");
      } else {
        setDisplayName(profile.full_name || "");
      }
    });
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await optimizeImage(file, AVATAR_PRESET);
      setAvatarUrl(result.dataUrl);
    } catch {
      // silently fail
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);

    const authorProfile: AuthorProfile = {
      id: `ap-${profile.id}`,
      user_id: profile.id,
      display_name: displayName,
      short_bio: shortBio,
      full_bio: fullBio,
      avatar_url: avatarUrl,
      batch,
      division,
      social_links: {
        ...(twitter ? { twitter } : {}),
        ...(linkedin ? { linkedin } : {}),
        ...(instagram ? { instagram } : {}),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await saveAuthorProfile(authorProfile);
    setSaving(false);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert("Failed to save profile: " + (result.error || "Unknown error"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Author Profile</h1>
          <p className="font-mono text-xs text-muted mt-1">
            YOUR PUBLIC AUTHOR IDENTITY
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(saving || saved) && (
            <span className="font-mono text-xs text-muted flex items-center gap-1">
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={12} className="text-green-400" />
                  Saved
                </>
              )}
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
          >
            <Save size={14} />
            SAVE PROFILE
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div
            className="w-28 h-28 rounded-xl bg-surface-light border border-border-subtle flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-gold/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle size={40} className="text-muted/30" />
            )}
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 font-mono text-xs px-4 py-2 border border-gold/50 text-gold rounded hover:bg-gold hover:text-background transition-all disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? "OPTIMIZING..." : "UPLOAD PHOTO"}
            </button>
            <p className="font-mono text-[10px] text-muted mt-1.5">
              JPG/PNG. Will be auto-optimized to 400x500px.
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

        {/* Display Name */}
        <div>
          <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
            DISPLAY NAME
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name as shown on articles"
            className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
          />
        </div>

        {/* Short Bio */}
        <div>
          <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
            SHORT BIO ({shortBio.length}/150)
          </label>
          <input
            type="text"
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value.slice(0, 150))}
            placeholder="A one-liner about you (shown on article cards)"
            className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
          />
        </div>

        {/* Full Bio */}
        <div>
          <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
            FULL BIO
          </label>
          <textarea
            value={fullBio}
            onChange={(e) => setFullBio(e.target.value)}
            placeholder="Tell readers about yourself, your interests, and your writing focus..."
            rows={4}
            className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-gold transition-all"
          />
        </div>

        {/* Batch + Division */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              BATCH
            </label>
            <input
              type="text"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="e.g. DSTSC 08"
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              DIVISION
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            >
              <option value="">Select division</option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <span className="font-mono text-xs text-gold tracking-widest mb-4 block">
            SOCIAL LINKS
          </span>
          <div className="space-y-3">
            <div className="relative">
              <Twitter
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40"
              />
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/username"
                className="w-full bg-surface border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
              />
            </div>
            <div className="relative">
              <Linkedin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40"
              />
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-surface border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
              />
            </div>
            <div className="relative">
              <Instagram
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40"
              />
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/username"
                className="w-full bg-surface border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
