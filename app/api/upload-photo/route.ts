import { NextRequest, NextResponse } from "next/server";
import { validateUploadToken } from "@/lib/upload-token";
import { createServiceRoleClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 uploads per minute per IP
    const ip = getClientIp(request.headers);
    const rl = rateLimit(`upload:${ip}`, 10);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, personnelId, imageData, editorial } = body as {
      token?: string;
      personnelId: string;
      imageData: string; // base64 data URL
      editorial?: boolean;
    };

    if (!personnelId || !imageData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Editorial uploads: validate via Supabase auth session
    if (editorial) {
      const { createServerClient } = await import("@supabase/ssr");
      const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        }
      );
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    } else {
      // Public upload: validate token
      if (!token) {
        return NextResponse.json(
          { error: "Missing token" },
          { status: 400 }
        );
      }
      const tokenResult = validateUploadToken(token);
      if (!tokenResult.valid) {
        return NextResponse.json(
          { error: tokenResult.expired ? "Link has expired" : "Invalid link" },
          { status: 403 }
        );
      }
    }

    // Validate personnel ID format
    if (!personnelId.startsWith("pers-")) {
      return NextResponse.json(
        { error: "Invalid personnel ID" },
        { status: 400 }
      );
    }

    // Convert base64 data URL to buffer
    const base64Match = imageData.match(
      /^data:image\/(jpeg|png|webp);base64,(.+)$/
    );
    if (!base64Match) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Match[2], "base64");
    const mimeType = `image/${base64Match[1]}`;
    const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
    const filename = `${personnelId}.${ext}`;

    // Validate file size (max 2MB after base64 decode)
    if (buffer.length > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large (max 2MB)" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Ensure bucket exists (idempotent)
    await supabase.storage.createBucket("personnel-photos", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    // Upload (upsert to allow re-upload)
    const { error: uploadError } = await supabase.storage
      .from("personnel-photos")
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: "86400",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("personnel-photos").getPublicUrl(filename);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
