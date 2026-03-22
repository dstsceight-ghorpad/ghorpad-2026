"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Image as ImageIcon, Users, Plus, Upload, Eye, Inbox, Sparkles } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useUser } from "../layout";
import { canManageTeam, canPublish } from "@/lib/auth";
import { formatDateShort } from "@/lib/utils";

interface DashboardStats {
  totalArticles: number;
  published: number;
  drafts: number;
  mediaFiles: number;
  inReview: number;
  submissions: number;
  pendingSubmissions: number;
}

export default function DashboardPage() {
  const { profile } = useUser();
  const [stats, setStats] = useState<DashboardStats>(
    { totalArticles: 0, published: 0, drafts: 0, mediaFiles: 0, inReview: 0, submissions: 0, pendingSubmissions: 0 }
  );
  const [inaugurationMode, setInaugurationMode] = useState(false);
  const [inaugurationLoading, setInaugurationLoading] = useState(true);
  const [inaugurationSaving, setInaugurationSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings?key=inauguration_mode")
      .then((res) => res.json())
      .then((data) => setInaugurationMode(data.value === "true"))
      .catch(() => {})
      .finally(() => setInaugurationLoading(false));
  }, []);

  async function toggleInauguration() {
    setInaugurationSaving(true);
    const newValue = !inaugurationMode;
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "inauguration_mode", value: String(newValue) }),
      });
      if (res.ok) {
        setInaugurationMode(newValue);
      }
    } catch {}
    setInaugurationSaving(false);
  }

  useEffect(() => {
    async function fetchStats() {
      const supabase = createBrowserSupabaseClient();

      const [articlesRes, publishedRes, draftsRes, mediaRes, reviewRes, subsRes, pendingSubsRes] =
        await Promise.all([
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("status", "published"),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("status", "draft"),
          supabase
            .from("media")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("status", "review"),
          supabase
            .from("submissions")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("submissions")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

      setStats({
        totalArticles: articlesRes.count || 0,
        published: publishedRes.count || 0,
        drafts: draftsRes.count || 0,
        mediaFiles: mediaRes.count || 0,
        inReview: reviewRes.count || 0,
        submissions: subsRes.count || 0,
        pendingSubmissions: pendingSubsRes.count || 0,
      });
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Articles",
      value: stats.totalArticles,
      icon: FileText,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Published",
      value: stats.published,
      icon: Eye,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Drafts",
      value: stats.drafts,
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Media Files",
      value: stats.mediaFiles,
      icon: ImageIcon,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "In Review",
      value: stats.inReview,
      icon: Eye,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: `Submissions (${stats.pendingSubmissions} pending)`,
      value: stats.submissions,
      icon: Inbox,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1">
          Welcome back
          {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="font-mono text-xs text-muted tracking-wider">
          // EDITORIAL DASHBOARD &middot;{" "}
          {formatDateShort(new Date().toISOString()).toUpperCase()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-surface border border-border-subtle rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold">{card.value}</p>
              <p className="font-mono text-[10px] text-muted tracking-wider mt-1">
                {card.label.toUpperCase()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-mono text-xs text-gold tracking-[0.2em] mb-4">
          // QUICK ACTIONS
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/editorial/articles/new"
            className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
          >
            <Plus size={14} />
            NEW ARTICLE
          </Link>
          <Link
            href="/editorial/media"
            className="flex items-center gap-2 bg-surface border border-border-subtle font-mono text-xs px-4 py-2.5 rounded-lg hover:border-gold/50 hover:text-gold transition-all"
          >
            <Upload size={14} />
            UPLOAD MEDIA
          </Link>
          <Link
            href="/editorial/articles"
            className="flex items-center gap-2 bg-surface border border-border-subtle font-mono text-xs px-4 py-2.5 rounded-lg hover:border-gold/50 hover:text-gold transition-all"
          >
            <FileText size={14} />
            ALL ARTICLES
          </Link>
          <Link
            href="/editorial/submissions"
            className="flex items-center gap-2 bg-surface border border-border-subtle font-mono text-xs px-4 py-2.5 rounded-lg hover:border-gold/50 hover:text-gold transition-all"
          >
            <Inbox size={14} />
            SUBMISSIONS
          </Link>
          {profile?.role && canManageTeam(profile.role) && (
            <Link
              href="/editorial/team"
              className="flex items-center gap-2 bg-surface border border-border-subtle font-mono text-xs px-4 py-2.5 rounded-lg hover:border-gold/50 hover:text-gold transition-all"
            >
              <Users size={14} />
              MANAGE TEAM
            </Link>
          )}
        </div>
      </div>

      {/* Site Controls — visible to editors and super_editors */}
      {profile?.role && canPublish(profile.role) && (
        <div className="mb-8">
          <h2 className="font-mono text-xs text-gold tracking-[0.2em] mb-4">
            // SITE CONTROLS
          </h2>
          <div className="bg-surface border border-border-subtle rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-400/10 p-2 rounded-lg">
                  <Sparkles size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Inauguration Landing Page</p>
                  <p className="font-mono text-[10px] text-muted mt-0.5">
                    {inaugurationLoading
                      ? "Loading..."
                      : inaugurationMode
                        ? "ENABLED — All visitors see the inauguration animation"
                        : "DISABLED — Visitors see the regular splash screen"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleInauguration}
                disabled={inaugurationLoading || inaugurationSaving}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  inaugurationMode ? "bg-gold" : "bg-zinc-600"
                } ${inaugurationLoading || inaugurationSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    inaugurationMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity placeholder */}
      <div>
        <h2 className="font-mono text-xs text-gold tracking-[0.2em] mb-4">
          // RECENT ACTIVITY
        </h2>
        <div className="bg-surface border border-border-subtle rounded-lg divide-y divide-border-subtle">
          {[
            {
              action: "Published",
              title: "Annual Tech Fest Draws Record Crowd",
              time: "2 hours ago",
            },
            {
              action: "Draft saved",
              title: "Interview with the Dean of Sciences",
              time: "5 hours ago",
            },
            {
              action: "Media uploaded",
              title: "campus-drone-view.jpg",
              time: "1 day ago",
            },
            {
              action: "Published",
              title: "Cricket Team Clinches Trophy",
              time: "2 days ago",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded shrink-0">
                  {item.action}
                </span>
                <span className="text-sm truncate">{item.title}</span>
              </div>
              <span className="font-mono text-[10px] text-muted shrink-0 ml-4">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
