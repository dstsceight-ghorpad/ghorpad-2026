import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { validateUploadToken } from "@/lib/upload-token";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/upload-baby — Upload a baby photo directly to the Families gallery.
 * Token-gated (same tokens as personnel photo upload).
 * Expects JSON: { token, childName, parentName, division, imageData (base64) }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 uploads per minute per IP
    const ip = getClientIp(request.headers);
    const rl = rateLimit(`baby-upload:${ip}`, 10);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, childName, parentName, division, imageData } = body;

    if (!token || !childName?.trim() || !parentName?.trim() || !imageData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate upload token
    const tokenResult = validateUploadToken(token);
    if (!tokenResult.valid) {
      return NextResponse.json(
        { error: tokenResult.expired ? "Token expired" : "Invalid token" },
        { status: 403 }
      );
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    const ext = base64Match[1] === "png" ? "png" : "jpg";
    const buffer = Buffer.from(base64Match[2], "base64");

    // Max 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large (max 5MB)" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const timestamp = Date.now();
    const sanitizedName = childName.trim().replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const storagePath = `gallery/milit-baby-${sanitizedName}-${timestamp}.${ext}`;

    // Upload to media bucket
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, buffer, {
        contentType: ext === "png" ? "image/png" : "image/jpeg",
        upsert: true,
        cacheControl: "86400",
      });

    if (uploadError) {
      console.error("Baby photo upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${storagePath}`;

    // Build description
    const desc = division
      ? `${parentName.trim()} | ${division} Division, DSTSC-08`
      : `${parentName.trim()} | DSTSC-08`;

    // Get any editor user ID for the uploaded_by FK constraint
    const { data: anyEditor } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["super_editor", "editor"])
      .limit(1)
      .single();

    // Insert gallery item
    const { data, error: insertError } = await supabase
      .from("gallery_items")
      .insert({
        title: childName.trim(),
        category: "Families",
        type: "image",
        url: publicUrl,
        aspect_ratio: "portrait",
        description: desc,
        uploaded_by: anyEditor?.id || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Baby gallery insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save to gallery" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, id: data.id, url: publicUrl },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
