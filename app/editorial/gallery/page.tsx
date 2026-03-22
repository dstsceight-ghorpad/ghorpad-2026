"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Trash2,
  Loader2,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useUser } from "../layout";
import { canManageGallery } from "@/lib/auth";
import { formatDateShort } from "@/lib/utils";
import type { GalleryItem, GalleryCategory } from "@/types";

const CATEGORIES: GalleryCategory[] = [
  "Ceremonies",
  "CAPSTAR",
  "Cultural",
  "Social",
  "Guest Lectures",
  "Sports",
  "Campus",
  "Adventures",
  "Families",
  "Creative",
];

const ASPECT_RATIOS = [
  { value: "landscape", label: "Landscape (16:9)" },
  { value: "portrait", label: "Portrait (3:4)" },
  { value: "square", label: "Square (1:1)" },
] as const;

export default function GalleryManagementPage() {
  const { profile } = useUser();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [filterCategory, setFilterCategory] = useState<GalleryCategory | "All">("All");

  // Upload form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("Families");
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "landscape" | "square">("square");
  const [description, setDescription] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const fetchItems = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("gallery_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) setItems(data as GalleryItem[]);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setPendingFiles(Array.from(files));
    // Auto-set title from first filename if empty
    if (!title && files.length === 1) {
      const name = files[0].name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setTitle(name);
    }
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0 || !profile || !title || !category) return;
    setUploading(true);

    const supabase = createBrowserSupabaseClient();

    // Ensure bucket exists as public (idempotent)
    await supabase.storage.createBucket("media", {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
    });

    for (const file of pendingFiles) {
      const isVideo = file.type.startsWith("video/");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `gallery/${Date.now()}-${safeName}`;

      const { data: uploadData, error } = await supabase.storage
        .from("media")
        .upload(filename, file);

      if (uploadData && !error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(uploadData.path);

        await supabase.from("gallery_items").insert({
          title,
          category,
          url: publicUrl,
          type: isVideo ? "video" : "image",
          aspect_ratio: aspectRatio,
          description: description || null,
          uploaded_by: profile.id,
          sort_order: 0,
        });
      }
    }

    // Reset form
    setTitle("");
    setDescription("");
    setPendingFiles([]);
    setUploading(false);
    fetchItems();
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;

    const supabase = createBrowserSupabaseClient();

    // Delete from storage — extract path from URL
    if (item.url) {
      const urlParts = item.url.split("/storage/v1/object/public/media/");
      if (urlParts[1]) {
        await supabase.storage.from("media").remove([urlParts[1]]);
      }
    }

    await supabase.from("gallery_items").delete().eq("id", item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const filtered =
    filterCategory === "All"
      ? items
      : items.filter((item) => item.category === filterCategory);

  const canManage = profile?.role && canManageGallery(profile.role);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold mb-1">Photo Gallery</h1>
        <p className="font-mono text-xs text-muted">
          // UPLOAD PHOTOS &middot; MILIT BABIES &middot; EVENTS &middot; CAMPUS
          LIFE
        </p>
      </div>

      {/* Upload section */}
      {canManage && (
        <div className="bg-surface border border-border-subtle rounded-xl p-6 mb-8">
          <h2 className="font-mono text-xs text-gold tracking-widest mb-4">
            // ADD TO GALLERY
          </h2>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="font-mono text-[10px] text-muted block mb-1">
                TITLE *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MILIT Babies 2026"
                className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-gold/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] text-muted block mb-1">
                CATEGORY *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-gold/50 focus:outline-none transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] text-muted block mb-1">
                ASPECT RATIO
              </label>
              <select
                value={aspectRatio}
                onChange={(e) =>
                  setAspectRatio(
                    e.target.value as "portrait" | "landscape" | "square"
                  )
                }
                className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-gold/50 focus:outline-none transition-colors"
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar.value} value={ar.value}>
                    {ar.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] text-muted block mb-1">
                DESCRIPTION
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional caption"
                className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-gold/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragOver
                ? "border-gold bg-gold/5"
                : "border-border-subtle hover:border-gold/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <Loader2
                className="mx-auto animate-spin text-gold mb-3"
                size={32}
              />
            ) : (
              <Upload className="mx-auto text-muted mb-3" size={32} />
            )}

            {pendingFiles.length > 0 ? (
              <div>
                <p className="text-sm text-foreground mb-2">
                  {pendingFiles.length} file(s) selected:{" "}
                  <span className="text-gold">
                    {pendingFiles.map((f) => f.name).join(", ")}
                  </span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={!title || uploading}
                    className="bg-gold text-background font-mono text-xs font-semibold px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "UPLOADING..." : "UPLOAD TO GALLERY"}
                  </button>
                  <button
                    onClick={() => setPendingFiles([])}
                    className="font-mono text-xs text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted mb-2">
                  Drag & drop photos here, or click to browse
                </p>
                <p className="font-mono text-[10px] text-muted/60 mb-4">
                  JPG, PNG, WebP, GIF
                </p>
                <label className="inline-block cursor-pointer bg-gold text-background font-mono text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors">
                  SELECT PHOTOS
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>
      )}

      {/* Category filter for viewing */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory("All")}
          className={`font-mono text-[10px] px-3 py-1 rounded transition-all ${
            filterCategory === "All"
              ? "bg-gold text-background"
              : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
          }`}
        >
          ALL ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`font-mono text-[10px] px-3 py-1 rounded transition-all ${
                filterCategory === cat
                  ? "bg-gold text-background"
                  : "text-muted border border-border-subtle hover:border-gold/50 hover:text-gold"
              }`}
            >
              {cat.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Gallery items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((item) => {
          const aspectClass =
            item.aspect_ratio === "portrait"
              ? "aspect-[3/4]"
              : item.aspect_ratio === "landscape"
              ? "aspect-video"
              : "aspect-square";

          return (
            <div
              key={item.id}
              className="bg-surface border border-border-subtle rounded-lg overflow-hidden group"
            >
              {/* Image thumbnail */}
              <div
                className={`${aspectClass} bg-surface-light relative overflow-hidden`}
              >
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="text-muted/30" size={32} />
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-2 left-2">
                  <span className="font-mono text-[8px] bg-gold text-background px-1.5 py-0.5 rounded">
                    {item.category.toUpperCase()}
                  </span>
                </div>

                {/* Delete overlay */}
                {canManage && (
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 bg-surface rounded-lg border border-border-subtle hover:border-red-accent/50 text-muted hover:text-red-accent transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-medium truncate mb-1">
                  {item.title}
                </p>
                <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                  <span>{item.aspect_ratio}</span>
                  <span>
                    {item.created_at ? formatDateShort(item.created_at) : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && !uploading && (
        <div className="text-center py-20">
          <Camera className="mx-auto text-muted/20 mb-4" size={48} />
          <p className="text-muted font-mono text-sm">
            No gallery photos yet. Upload your first photo above.
          </p>
        </div>
      )}
    </div>
  );
}
