import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { validateUploadToken } from "@/lib/upload-token";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const EDITOR_ID = "b0571c95-8e1e-4fa9-b569-c8a078afcea9";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * POST /api/upload-event — Upload an event photo (token-gated, HD original)
 * Accepts multipart form: file, caption, photographer, event, category
 */
export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`event-upload:${ip}`, 20);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a minute." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const token = formData.get("token") as string;
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";
  const photographer = (formData.get("photographer") as string) || "";
  const event = (formData.get("event") as string) || "Event";
  const category = (formData.get("category") as string) || "Cultural";

  // Validate token
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 401 });
  }
  const tokenResult = validateUploadToken(token);
  if (!tokenResult.valid) {
    return NextResponse.json(
      { error: tokenResult.expired ? "Token expired" : "Invalid token" },
      { status: 401 }
    );
  }

  // Validate file
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 15MB)" },
      { status: 400 }
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files allowed" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  // Upload original HD to storage
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const eventSlug = event.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `events/${eventSlug}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: "604800", // 7 days
    });

  if (uploadError) {
    console.error("Event photo upload error:", uploadError);
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    );
  }

  const { data: { publicUrl } } = supabase.storage
    .from("media")
    .getPublicUrl(filename);

  // Build description
  const descParts = [];
  if (caption.trim()) descParts.push(caption.trim());
  if (photographer.trim()) descParts.push(`Contributed by ${photographer.trim()}`);
  descParts.push(`${event} — DSTSC-08`);
  const description = descParts.join(" | ");

  // Insert gallery_items record — status "pending" for editorial review
  const { error: dbError } = await supabase.from("gallery_items").insert({
    title: caption.trim() || `${event} Photo`,
    category,
    type: "image",
    url: publicUrl,
    thumbnail: publicUrl,
    aspect_ratio: "landscape",
    description,
    sort_order: 500,
    uploaded_by: EDITOR_ID,
    status: "pending",
  });

  if (dbError) {
    console.error("Gallery insert error:", dbError);
    return NextResponse.json(
      { error: "Failed to save: " + dbError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, url: publicUrl }, { status: 201 });
}
