import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const BUCKET = "submission-attachments";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/**
 * POST /api/submissions/upload — Public.
 * Returns a signed upload URL so the browser can upload directly to Supabase
 * Storage (bypasses Vercel's 4.5 MB body size limit).
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 uploads per minute per IP
    const ip = getClientIp(request.headers);
    const rl = rateLimit(`sub-upload:${ip}`, 5);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { filename, size, type } = body as {
      filename: string;
      size: number;
      type: string;
    };

    if (!filename || !size) {
      return NextResponse.json(
        { error: "Missing filename or size" },
        { status: 400 }
      );
    }

    // Validate file size
    if (size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    // Validate file extension
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload PDF, Word (.doc/.docx), JPEG, or PNG files.",
        },
        { status: 400 }
      );
    }

    const contentType = type || MIME_MAP[ext] || "application/octet-stream";

    const supabase = createServiceRoleClient();

    // Ensure bucket exists (idempotent — no-ops if already exists)
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_SIZE,
    });

    // Generate unique storage path
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${Date.now()}-${safeName}`;

    // Create a signed upload URL (valid for 5 minutes)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (signedError || !signedData) {
      console.error("Signed URL error:", signedError);
      return NextResponse.json(
        { error: "Failed to prepare upload" },
        { status: 500 }
      );
    }

    // Get the public URL for after upload completes
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      token: signedData.token,
      path: signedData.path,
      publicUrl,
      contentType,
    });
  } catch (err) {
    console.error("Submission upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
