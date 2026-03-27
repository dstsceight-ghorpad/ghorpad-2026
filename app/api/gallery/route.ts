import { NextRequest, NextResponse } from "next/server";
import { verifyCsrf } from "@/lib/rate-limit";
import { authenticateEditorRequest } from "@/lib/auth";

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
    if (!verifyCsrf(request.headers)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const auth = await authenticateEditorRequest(request);
    if ("error" in auth) return auth.error;
    const { user, supabase } = auth;

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
        cacheControl: "86400",
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

/**
 * DELETE /api/gallery — Delete a gallery item (server-side with auth).
 * Expects JSON body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!verifyCsrf(request.headers)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const auth = await authenticateEditorRequest(request);
    if ("error" in auth) return auth.error;
    const { supabase } = auth;

    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "Missing gallery item id" }, { status: 400 });
    }

    // Fetch the item to get the storage path
    const { data: item, error: fetchError } = await supabase
      .from("gallery_items")
      .select("url")
      .eq("id", id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    // Extract storage path from public URL
    const url = item.url as string;
    const pathMatch = url.match(/\/media\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from("media").remove([pathMatch[1]]);
    }

    // Delete the DB record
    const { error: deleteError } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gallery delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
