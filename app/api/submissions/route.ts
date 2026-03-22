import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/submissions — Public. Creates a new submission.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per minute per IP
    const ip = getClientIp(request.headers);
    const rl = rateLimit(`submissions:${ip}`, 5);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      id,
      type,
      category,
      title,
      author_name,
      author_email,
      author_division,
      contributor_type,
      relation,
      officer_name,
      content,
      attachment_url,
    } = body;

    // Basic validation — require id, type, title, author, and either content or attachment
    if (!id || !type || !title || !author_name || (!content && !attachment_url)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validTypes = ["article", "photo", "poem", "sketch", "meme"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid submission type" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("submissions").insert({
      id,
      type,
      category: category || "",
      title,
      author_name,
      author_email: author_email || "",
      author_division: author_division || null,
      contributor_type: contributor_type || "officer",
      relation: relation || null,
      officer_name: officer_name || null,
      content: content || "",
      attachment_url: attachment_url || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Submissions POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/submissions — Authenticated (editorial). Returns all submissions.
 */
export async function GET(request: NextRequest) {
  try {
    // Validate auth via Supabase session cookie
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

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return NextResponse.json(
        { error: "Failed to load submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Submissions GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
