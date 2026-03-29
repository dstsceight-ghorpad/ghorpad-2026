import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

/**
 * GET /api/personnel — Fetch all personnel
 */
export async function GET() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("personnel")
    .select("*")
    .order("personnel_role", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * PATCH /api/personnel — Update a personnel record (editor only)
 * Body: { id: string, updates: Record<string, unknown> }
 */
export async function PATCH(request: NextRequest) {
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

  if (!profile || (profile.role !== "super_editor" && profile.role !== "editor")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { id, updates } = await request.json();
  if (!id || !updates) {
    return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });
  }

  // Add updated_at timestamp
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("personnel")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
