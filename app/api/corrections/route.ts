import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/corrections — Submit a profile correction request
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`corrections:${ip}`, 10);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a minute." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { personnel_id, personnel_name, division, reporter_name, description } = body;

  if (!personnel_name || !description?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (description.length > 500) {
    return NextResponse.json({ error: "Description too long (max 500 chars)" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("corrections").insert({
    personnel_id,
    personnel_name,
    division,
    reporter_name: reporter_name || "Anonymous",
    description: description.trim(),
  });

  if (error) {
    console.error("Correction insert error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

/**
 * GET /api/corrections — Fetch all corrections (editorial use)
 */
export async function GET() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("corrections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * PATCH /api/corrections — Update correction status (editorial use)
 */
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("corrections")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
