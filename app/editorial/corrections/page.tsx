"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

interface Correction {
  id: string;
  personnel_id: string;
  personnel_name: string;
  division: string;
  reporter_name: string;
  description: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
}

type FilterTab = "all" | "pending" | "reviewed" | "resolved";

const STATUS_CONFIG = {
  pending: {
    label: "PENDING",
    color: "bg-yellow-500/10 text-yellow-400",
    icon: Clock,
  },
  reviewed: {
    label: "REVIEWED",
    color: "bg-blue-500/10 text-blue-400",
    icon: Eye,
  },
  resolved: {
    label: "RESOLVED",
    color: "bg-green-500/10 text-green-400",
    icon: CheckCircle2,
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CorrectionsPage() {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCorrections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/corrections");
      if (res.ok) {
        setCorrections(await res.json());
      }
    } catch {
      console.error("Failed to fetch corrections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCorrections();
  }, [fetchCorrections]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/corrections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setCorrections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: status as Correction["status"] } : c))
        );
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = corrections.filter((c) =>
    activeTab === "all" ? true : c.status === activeTab
  );

  const counts = {
    all: corrections.length,
    pending: corrections.filter((c) => c.status === "pending").length,
    reviewed: corrections.filter((c) => c.status === "reviewed").length,
    resolved: corrections.filter((c) => c.status === "resolved").length,
  };

  // Group by division
  const byDivision: Record<string, Correction[]> = {};
  for (const c of filtered) {
    const div = c.division || "Other";
    if (!byDivision[div]) byDivision[div] = [];
    byDivision[div].push(c);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gold" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-400" />
            <h1 className="font-serif text-2xl font-bold">Profile Corrections</h1>
          </div>
          <p className="font-mono text-xs text-muted mt-1">
            // REPORTED ISSUES &middot; {counts.all} TOTAL &middot; {counts.pending} PENDING
          </p>
        </div>
        <button
          onClick={fetchCorrections}
          className="flex items-center gap-2 font-mono text-xs text-muted border border-border-subtle px-3 py-2 rounded-lg hover:border-gold/40 hover:text-gold transition-colors"
        >
          <RefreshCw size={12} />
          REFRESH
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "reviewed", "resolved"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono text-[10px] px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === tab
                ? "bg-gold text-background font-semibold"
                : "text-muted border border-border-subtle hover:border-gold/40"
            }`}
          >
            {tab.toUpperCase()}
            <span className="bg-background/20 px-1.5 py-0.5 rounded text-[9px]">
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle2 size={32} className="mx-auto text-green-400/30 mb-3" />
          <p className="font-mono text-xs text-muted">
            {activeTab === "all"
              ? "No corrections reported yet."
              : `No ${activeTab} corrections.`}
          </p>
        </div>
      )}

      {/* Corrections grouped by division */}
      {Object.entries(byDivision).map(([division, items]) => (
        <div key={division} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-gold" />
            <h2 className="font-mono text-xs text-gold tracking-widest">
              {division.toUpperCase()} DIVISION
            </h2>
            <span className="font-mono text-[9px] text-muted">({items.length})</span>
          </div>

          <div className="space-y-3">
            {items.map((c) => {
              const config = STATUS_CONFIG[c.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={c.id}
                  className={`bg-surface border rounded-lg p-4 transition-all ${
                    c.status === "pending"
                      ? "border-yellow-500/20"
                      : c.status === "reviewed"
                        ? "border-blue-500/20"
                        : "border-green-500/20 opacity-70"
                  }`}
                >
                  {/* Top row: name + status + time */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <User size={14} className="text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.personnel_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[9px] text-muted">
                            Reported by: {c.reporter_name}
                          </span>
                          <span className="font-mono text-[9px] text-muted/50 flex items-center gap-1">
                            <Calendar size={9} />
                            {timeAgo(c.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`font-mono text-[9px] px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${config.color}`}
                    >
                      <StatusIcon size={10} />
                      {config.label}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="bg-surface-light border border-border-subtle rounded-lg p-3 mb-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {c.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {c.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(c.id, "reviewed")}
                          disabled={updating === c.id}
                          className="flex items-center gap-1.5 font-mono text-[10px] text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                        >
                          <Eye size={11} />
                          MARK REVIEWED
                        </button>
                        <button
                          onClick={() => updateStatus(c.id, "resolved")}
                          disabled={updating === c.id}
                          className="flex items-center gap-1.5 font-mono text-[10px] text-green-400 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-500/10 transition-colors disabled:opacity-50"
                        >
                          <Check size={11} />
                          RESOLVE
                        </button>
                      </>
                    )}
                    {c.status === "reviewed" && (
                      <button
                        onClick={() => updateStatus(c.id, "resolved")}
                        disabled={updating === c.id}
                        className="flex items-center gap-1.5 font-mono text-[10px] text-green-400 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-500/10 transition-colors disabled:opacity-50"
                      >
                        <Check size={11} />
                        MARK RESOLVED
                      </button>
                    )}
                    {c.status === "resolved" && (
                      <button
                        onClick={() => updateStatus(c.id, "pending")}
                        disabled={updating === c.id}
                        className="flex items-center gap-1.5 font-mono text-[10px] text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={11} />
                        REOPEN
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
