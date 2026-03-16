import { NextRequest, NextResponse } from "next/server";
import { validateUploadToken } from "@/lib/upload-token";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const result = validateUploadToken(token);
  if (!result.valid) {
    return NextResponse.json(
      { valid: false, expired: result.expired ?? false },
      { status: 403 }
    );
  }

  // Fetch list of already-uploaded personnel photo IDs
  const supabase = createServiceRoleClient();
  const { data: files } = await supabase.storage
    .from("personnel-photos")
    .list("", { limit: 500 });

  const uploadedIds = (files || [])
    .map((f) => f.name.replace(/\.[^.]+$/, "")) // strip extension
    .filter((name) => name.startsWith("pers-"));

  return NextResponse.json({ valid: true, uploadedIds });
}
