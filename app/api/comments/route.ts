import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
  // Rate limit: 5 comments per minute per IP
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`comments:${ip}`, 5);
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

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      article_id,
      author_name: author_name.trim(),
      content: content.trim(),
    })
    .select("id, author_name, content, created_at")
    .single();

  if (error) {
    console.error("Comment insert error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
