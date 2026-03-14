import type { Profile } from "@/types";

// Demo mode activates when Supabase URL is not configured
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url === "your_supabase_url_here" || url === "";
}

export const DEMO_CREDENTIALS = {
  email: "editor@ghorpad.in",
  password: "demo1234",
};

export const DEMO_PROFILE: Profile = {
  id: "demo-user-001",
  full_name: "Chinthu Krishnan V",
  role: "super_editor",
  avatar_url: null,
  created_at: "2024-08-15T10:00:00Z",
  is_active: true,
};

export const DEMO_PROFILES: Profile[] = [
  {
    id: "demo-user-001",
    full_name: "Chinthu Krishnan V",
    role: "super_editor",
    avatar_url: null,
    created_at: "2024-08-15T10:00:00Z",
    is_active: true,
  },
  {
    id: "demo-user-002",
    full_name: "Harvinder",
    role: "editor",
    avatar_url: null,
    created_at: "2024-09-01T10:00:00Z",
    is_active: true,
  },
  {
    id: "demo-user-003",
    full_name: "Kapil",
    role: "contributor",
    avatar_url: null,
    created_at: "2024-10-10T10:00:00Z",
    is_active: true,
  },
];

const DEMO_SESSION_KEY = "ghorpad_demo_session";

export function setDemoSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(DEMO_SESSION_KEY, "true");
  }
}

export function hasDemoSession(): boolean {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(DEMO_SESSION_KEY) === "true";
  }
  return false;
}

export function clearDemoSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }
}
