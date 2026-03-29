import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { AuthorProfile } from "@/types";

const PROFILE_DISMISSED_KEY = "ghorpad_profile_dismissed";

/**
 * Load an author's extended profile from Supabase.
 */
export async function loadAuthorProfile(
  userId: string
): Promise<AuthorProfile | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, display_name, short_bio, full_bio, avatar_url, batch, division, social_links, created_at, updated_at"
    )
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: `ap-${data.id}`,
    user_id: data.id,
    display_name: data.display_name || data.full_name || "",
    short_bio: data.short_bio || "",
    full_bio: data.full_bio || "",
    avatar_url: data.avatar_url,
    batch: data.batch || "",
    division: data.division || "",
    social_links: data.social_links || {},
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
  };
}

/**
 * Save an author's extended profile to Supabase.
 */
export async function saveAuthorProfile(
  profile: AuthorProfile
): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: profile.display_name,
      short_bio: profile.short_bio,
      full_bio: profile.full_bio,
      avatar_url: profile.avatar_url,
      batch: profile.batch,
      division: profile.division,
      social_links: profile.social_links,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.user_id);

  if (error) {
    console.error("Failed to save profile:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function hasCompletedProfile(userId: string): Promise<boolean> {
  const profile = await loadAuthorProfile(userId);
  return profile !== null && profile.display_name.length > 0;
}

export function dismissProfilePrompt(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PROFILE_DISMISSED_KEY, "true");
}

export function isProfilePromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(PROFILE_DISMISSED_KEY) === "true";
}
