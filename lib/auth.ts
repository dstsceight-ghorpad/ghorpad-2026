import type { Role } from "@/types";

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
