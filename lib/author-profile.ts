import type { AuthorProfile } from "@/types";

const AUTHOR_PROFILES_KEY = "ghorpad_author_profiles";
const PROFILE_DISMISSED_KEY = "ghorpad_profile_dismissed";

type ProfileStore = Record<string, AuthorProfile>;

export function loadDemoAuthorProfile(userId: string): AuthorProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTHOR_PROFILES_KEY);
  if (!raw) return null;
  try {
    const store: ProfileStore = JSON.parse(raw);
    return store[userId] || null;
  } catch {
    return null;
  }
}

export function saveDemoAuthorProfile(profile: AuthorProfile): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(AUTHOR_PROFILES_KEY);
  const store: ProfileStore = raw ? JSON.parse(raw) : {};
  store[profile.user_id] = profile;
  localStorage.setItem(AUTHOR_PROFILES_KEY, JSON.stringify(store));
}

export function hasCompletedProfile(userId: string): boolean {
  if (typeof window === "undefined") return true;
  const profile = loadDemoAuthorProfile(userId);
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
