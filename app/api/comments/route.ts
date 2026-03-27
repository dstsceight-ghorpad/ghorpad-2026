import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { rateLimit, getClientIp, verifyCsrf, RATE_LIMITS } from "@/lib/rate-limit";

/** Strip HTML tags and dangerous characters to prevent XSS */
function sanitize(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * GET /api/comments?article_id=xxx — Fetch approved comments for an article
 */
export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("article_id");
  if (!articleId) {
    return NextResponse.json({ error: "article_id is required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, content, created_at")
    .eq("article_id", articleId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

/**
 * POST /api/comments — Submit a new comment
 */
export async function POST(request: NextRequest) {
  // CSRF check
  if (!verifyCsrf(request.headers)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const rl = rateLimit(`comments:${ip}`, RATE_LIMITS.COMMENTS_PER_MIN);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Too many comments. Please wait a minute." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { article_id, author_name, content } = body;

  if (!article_id || !author_name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "Comment too long (max 500 characters)" }, { status: 400 });
  }

  const authorRl = rateLimit(`comments-author:${author_name.trim().toLowerCase()}`, RATE_LIMITS.COMMENTS_PER_AUTHOR);
  if (authorRl.limited) {
    return NextResponse.json(
      { error: "Too many comments from this name. Please wait." },
      { status: 429 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      article_id,
      author_name: sanitize(author_name),
      content: sanitize(content),
    })
    .select("id, author_name, content, created_at")
    .single();

  if (error) {
    console.error("Comment insert error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

/**
 * PATCH /api/comments — Approve/reject a comment (editor only)
 * Body: { id: string, is_approved: boolean }
 */
export async function PATCH(request: NextRequest) {
  if (!verifyCsrf(request.headers)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const { authenticateEditorRequest } = await import("@/lib/auth");
  const auth = await authenticateEditorRequest(request);
  if ("error" in auth) return auth.error;

  const { id, is_approved } = await request.json();
  if (!id || typeof is_approved !== "boolean") {
    return NextResponse.json({ error: "Missing id or is_approved" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("comments")
    .update({ is_approved })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/comments — Delete a comment (editor only)
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  if (!verifyCsrf(request.headers)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const { authenticateEditorRequest } = await import("@/lib/auth");
  const auth = await authenticateEditorRequest(request);
  if ("error" in auth) return auth.error;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing comment id" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
