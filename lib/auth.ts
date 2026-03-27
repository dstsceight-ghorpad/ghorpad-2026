import type { Role } from "@/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Authenticate a request and verify the user has an editor or super_editor role.
 * Returns { user, supabase, role } on success, or { error: NextResponse } on failure.
 */
export async function authenticateEditorRequest(
  request: NextRequest
): Promise<
  | { user: User; supabase: SupabaseClient; role: Role }
  | { error: NextResponse }
> {
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
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabase = createServiceRoleClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !canPublish(profile.role as Role)) {
    return { error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }

  return { user, supabase, role: profile.role as Role };
}

export function canPublish(role: Role): boolean {
  return role === "super_editor" || role === "editor";
}

export function canManageTeam(role: Role): boolean {
  return role === "super_editor";
}

export function canDeleteMedia(role: Role): boolean {
  return role === "super_editor" || role === "editor";
}

export function canManageGallery(role: Role): boolean {
  return role === "super_editor" || role === "editor";
}

export function canEditArticle(role: Role, authorId: string, userId: string): boolean {
  if (role === "super_editor") return true;
  if (role === "editor") return true;
  return authorId === userId;
}

export function getRoleBadgeColor(role: Role): string {
  switch (role) {
    case "super_editor":
      return "bg-gold/20 text-gold";
    case "editor":
      return "bg-blue-500/20 text-blue-400";
    case "contributor":
      return "bg-green-500/20 text-green-400";
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "super_editor":
      return "Super Editor";
    case "editor":
      return "Editor";
    case "contributor":
      return "Contributor";
  }
}
