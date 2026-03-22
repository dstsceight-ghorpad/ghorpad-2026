import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

/**
 * POST /api/gallery — Upload a gallery image (server-side with service role).
 * Expects multipart/form-data with:
 *   - file: the image file
 *   - title: string
 *   - category: GalleryCategory
 *   - aspect_ratio: portrait | landscape | square
 *   - description?: string
 */
export async function POST(request: NextRequest) {
  try {
    // Validate user session via Supabase auth cookies
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
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const supabase = createServiceRoleClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      !profile ||
      (profile.role !== "super_editor" && profile.role !== "editor")
    ) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const aspectRatio = formData.get("aspect_ratio") as string;
    const description = formData.get("description") as string | null;

    if (!file || !title || !category || !aspectRatio) {
      return NextResponse.json(
        { error: "Missing required fields (file, title, category, aspect_ratio)" },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 }
      );
    }

    const isVideo = file.type.startsWith("video/");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `gallery/${Date.now()}-${safeName}`;

    // Upload to storage using service role (bypasses RLS)
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Gallery upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file: " + uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(uploadData.path);

    // Insert gallery item record
    const { data: item, error: insertError } = await supabase
      .from("gallery_items")
      .insert({
        title,
        category,
        url: publicUrl,
        type: isVideo ? "video" : "image",
        aspect_ratio: aspectRatio,
        description: description || null,
        uploaded_by: user.id,
        sort_order: 0,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Gallery insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save gallery item: " + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: item.id,
      url: publicUrl,
    });
  } catch (err) {
    console.error("Gallery route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
