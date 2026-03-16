"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Users,
  Users2,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCircle,
  ClipboardCheck,
  Inbox,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getRoleBadgeColor, getRoleLabel } from "@/lib/auth";
import { loadAuthorProfile } from "@/lib/author-profile";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface UserContextType {
  profile: Profile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  loading: true,
});

export function useUser() {
  return useContext(UserContext);
}

const sidebarLinks = [
  { label: "Dashboard", href: "/editorial/dashboard", icon: LayoutDashboard },
  { label: "Articles", href: "/editorial/articles/new", icon: FileText },
  { label: "Media", href: "/editorial/media", icon: ImageIcon },
  { label: "Review", href: "/editorial/review", icon: ClipboardCheck },
  { label: "Submissions", href: "/editorial/submissions", icon: Inbox },
  { label: "Personnel", href: "/editorial/personnel", icon: Users2 },
  { label: "My Profile", href: "/editorial/profile", icon: UserCircle },
  { label: "Team", href: "/editorial/team", icon: Users, superOnly: true },
];

export default function EditorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/editorial/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/editorial/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        const p = data as Profile;
        // If full_name is missing, check author profile (localStorage) or use email
        if (!p.full_name) {
          const authorProfile = loadAuthorProfile(user.id);
          if (authorProfile?.display_name) {
            p.full_name = authorProfile.display_name;
          } else if (user.email) {
            p.full_name = user.email.split("@")[0];
          }
        }
        setProfile(p);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/editorial/login");
  };

  // Don't wrap login page in editorial layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <UserContext.Provider value={{ profile, loading }}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 bg-surface border-r border-border-subtle flex-col fixed h-full z-40">
          {/* Logo */}
          <div className="p-4 border-b border-border-subtle">
            <Link href="/editorial/dashboard" className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold">GHORPAD</span>
              <span className="font-mono text-[10px] text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                HQ
              </span>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                {profile?.full_name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || "Loading..."}
                </p>
                {profile?.role && (
                  <span
                    className={cn(
                      "font-mono text-[10px] px-1.5 py-0.5 rounded",
                      getRoleBadgeColor(profile.role)
                    )}
                  >
                    {getRoleLabel(profile.role)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-3 space-y-1">
            {sidebarLinks
              .filter(
                (link) =>
                  !link.superOnly || profile?.role === "super_editor"
              )
              .map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-all",
                      isActive
                        ? "bg-gold/10 text-gold"
                        : "text-muted hover:text-foreground hover:bg-surface-light"
                    )}
                  >
                    <Icon size={16} />
                    {link.label}
                    {isActive && (
                      <ChevronRight size={12} className="ml-auto" />
                    )}
                  </Link>
                );
              })}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-border-subtle space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs text-muted hover:text-foreground hover:bg-surface-light transition-all"
            >
              <ExternalLink size={16} />
              View Live Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs text-muted hover:text-red-accent hover:bg-red-accent/10 transition-all w-full text-left"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border-subtle">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <span className="font-serif text-sm font-bold">EDITORIAL HQ</span>
            <button onClick={handleLogout}>
              <LogOut size={18} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="w-64 bg-surface h-full border-r border-border-subtle p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-lg font-bold">GHORPAD</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              {sidebarLinks
                .filter(
                  (link) =>
                    !link.superOnly || profile?.role === "super_editor"
                )
                .map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs text-muted hover:text-foreground hover:bg-surface-light"
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </UserContext.Provider>
  );
}
