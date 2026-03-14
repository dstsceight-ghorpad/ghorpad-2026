"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Copy, Check, Image as ImageIcon, Film, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useUser } from "../layout";
import { canDeleteMedia } from "@/lib/auth";
import { formatFileSize, formatDateShort } from "@/lib/utils";
import type { Media } from "@/types";

export default function MediaLibraryPage() {
  const { profile } = useUser();
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchMedia = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("media")
      .select("*, uploader:profiles(full_name)")
      .order("created_at", { ascending: false });

    if (data) setMedia(data as unknown as Media[]);
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !profile) return;
    setUploading(true);

    const supabase = createBrowserSupabaseClient();

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const filename = `${Date.now()}-${file.name}`;

      const { data: uploadData, error } = await supabase.storage
        .from("media")
        .upload(filename, file);

      if (uploadData && !error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(uploadData.path);

        await supabase.from("media").insert({
          filename: file.name,
          url: publicUrl,
          type: isVideo ? "video" : "image",
          size_bytes: file.size,
          uploaded_by: profile.id,
        });
      }
    }

    setUploading(false);
    fetchMedia();
  };

  const handleDelete = async (id: string) => {
    const supabase = createBrowserSupabaseClient();
    await supabase.from("media").delete().eq("id", id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold mb-1">Media Library</h1>
        <p className="font-mono text-xs text-muted">
          // UPLOAD &middot; MANAGE &middot; ORGANIZE
        </p>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center mb-8 transition-all ${
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
          <Loader2 className="mx-auto animate-spin text-gold mb-3" size={32} />
        ) : (
          <Upload className="mx-auto text-muted mb-3" size={32} />
        )}
        <p className="text-sm text-muted mb-2">
          {uploading
            ? "Uploading..."
            : "Drag & drop files here, or click to browse"}
        </p>
        <p className="font-mono text-[10px] text-muted/60 mb-4">
          JPG, PNG, WebP, GIF, MP4, MOV
        </p>
        <label className="inline-block cursor-pointer bg-gold text-background font-mono text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors">
          BROWSE FILES
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-surface border border-border-subtle rounded-lg overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-surface-light relative flex items-center justify-center">
              {item.type === "video" ? (
                <Film className="text-muted/30" size={32} />
              ) : (
                <ImageIcon className="text-muted/30" size={32} />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopy(item.url, item.id)}
                  className="p-2 bg-surface rounded-lg border border-border-subtle hover:border-gold/50 text-muted hover:text-gold transition-all"
                  title="Copy URL"
                >
                  {copiedId === item.id ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                {profile?.role && canDeleteMedia(profile.role) && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-surface rounded-lg border border-border-subtle hover:border-red-accent/50 text-muted hover:text-red-accent transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs truncate mb-1">{item.filename}</p>
              <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                <span>{formatFileSize(item.size_bytes)}</span>
                <span>{formatDateShort(item.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && !uploading && (
        <div className="text-center py-20">
          <ImageIcon className="mx-auto text-muted/20 mb-4" size={48} />
          <p className="text-muted font-mono text-sm">
            No media files yet. Upload your first file above.
          </p>
        </div>
      )}
    </div>
  );
}
