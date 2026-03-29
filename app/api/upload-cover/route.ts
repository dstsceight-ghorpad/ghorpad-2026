import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

/**
 * POST /api/upload-cover — Upload a cover image (editor only, uses service role)
 * Expects multipart/form-data with a "file" field
 */
export async function POST(request: NextRequest) {
  // Verify auth
  const { createServerClient } = await import("@supabase/ssr");
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check editor role
  const supabase = createServiceRoleClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "super_editor" && profile.role !== "editor" && profile.role !== "contributor")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Parse the multipart form
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const articleId = formData.get("articleId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Create a unique filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = articleId
    ? `cover-${articleId}-${Date.now()}-${safeName}`
    : `cover-${Date.now()}-${safeName}`;

  // Upload using service role (bypasses RLS)
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("article-covers")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: "86400",
    });

  if (uploadError) {
    console.error("Cover upload error:", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("article-covers")
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
