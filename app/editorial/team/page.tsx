"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, Ban, Trash2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useUser } from "../layout";
import { getRoleBadgeColor, getRoleLabel } from "@/lib/auth";
import { formatDateShort, cn } from "@/lib/utils";
import type { Profile, Role } from "@/types";

export default function TeamPage() {
  const { profile } = useUser();
  const [members, setMembers] = useState<Profile[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("contributor");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setMembers(data as Profile[]);
    }

    fetchMembers();
  }, []);

  // Only super_editor can access this page
  if (profile && profile.role !== "super_editor") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Shield className="mx-auto text-red-accent mb-4" size={48} />
          <h2 className="font-serif text-xl mb-2">Access Restricted</h2>
          <p className="font-mono text-xs text-muted">
            Only Super Editors can manage the team.
          </p>
        </div>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    const supabase = createBrowserSupabaseClient();
    await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    );
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    const supabase = createBrowserSupabaseClient();
    await supabase
      .from("profiles")
      .update({ is_active: !isActive })
      .eq("id", userId);

    setMembers((prev) =>
      prev.map((m) =>
        m.id === userId ? { ...m, is_active: !isActive } : m
      )
    );
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.admin.inviteUserByEmail(inviteEmail);
      setShowInvite(false);
      setInviteEmail("");
    } catch {
      // Invite requires service role — show info
      alert(
        "Invite functionality requires a server-side API route with service role key."
      );
    }

    setInviting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold mb-1">Team Management</h1>
          <p className="font-mono text-xs text-muted">
            // MANAGE EDITORIAL TEAM MEMBERS
          </p>
        </div>

        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
        >
          <UserPlus size={14} />
          INVITE MEMBER
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-surface border border-border-subtle rounded-lg p-6 mb-8">
          <h3 className="font-mono text-xs text-gold tracking-widest mb-4">
            // INVITE NEW MEMBER
          </h3>
          <form onSubmit={handleInvite} className="flex flex-wrap gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="flex-1 min-w-[200px] bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-all"
            >
              <option value="contributor">Contributor</option>
              <option value="editor">Editor</option>
              <option value="super_editor">Super Editor</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="bg-gold text-background font-mono text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
            >
              {inviting ? "SENDING..." : "SEND INVITE"}
            </button>
          </form>
        </div>
      )}

      {/* Members table */}
      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr,1fr,auto,auto,auto] gap-4 px-4 py-3 border-b border-border-subtle bg-surface-light">
          <span className="font-mono text-[10px] text-muted tracking-widest">
            NAME
          </span>
          <span className="font-mono text-[10px] text-muted tracking-widest">
            EMAIL
          </span>
          <span className="font-mono text-[10px] text-muted tracking-widest">
            ROLE
          </span>
          <span className="font-mono text-[10px] text-muted tracking-widest">
            JOINED
          </span>
          <span className="font-mono text-[10px] text-muted tracking-widest">
            ACTIONS
          </span>
        </div>

        {/* Rows */}
        {members.map((member) => (
          <div
            key={member.id}
            className={cn(
              "grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto,auto,auto] gap-3 sm:gap-4 px-4 py-3 border-b border-border-subtle items-center",
              !member.is_active && "opacity-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs shrink-0">
                {member.full_name.charAt(0)}
              </div>
              <span className="text-sm font-medium truncate">
                {member.full_name}
              </span>
            </div>

            <span className="text-sm text-muted truncate font-mono text-xs">
              {member.id.slice(0, 8)}...
            </span>

            <select
              value={member.role}
              onChange={(e) =>
                handleRoleChange(member.id, e.target.value as Role)
              }
              disabled={member.id === profile?.id}
              className={cn(
                "font-mono text-[10px] px-2 py-1 rounded border-0 focus:outline-none",
                getRoleBadgeColor(member.role),
                member.id === profile?.id && "cursor-not-allowed"
              )}
            >
              <option value="contributor">Contributor</option>
              <option value="editor">Editor</option>
              <option value="super_editor">Super Editor</option>
            </select>

            <span className="font-mono text-[10px] text-muted">
              {formatDateShort(member.created_at)}
            </span>

            <div className="flex items-center gap-2">
              {member.id !== profile?.id && (
                <>
                  <button
                    onClick={() =>
                      handleToggleActive(member.id, member.is_active)
                    }
                    className="p-1.5 rounded hover:bg-surface-light text-muted hover:text-gold transition-all"
                    title={member.is_active ? "Suspend" : "Activate"}
                  >
                    <Ban size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted font-mono text-sm">
              No team members found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
