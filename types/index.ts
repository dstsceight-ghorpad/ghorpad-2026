export type Role = "super_editor" | "editor" | "contributor";

export type ArticleStatus = "draft" | "review" | "published";

export type MediaType = "image" | "video";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  is_active: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown> | null;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  status: ArticleStatus;
  is_featured: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  read_time_minutes: number;
  contributor_name?: string;
  author?: Profile;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  type: MediaType;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  uploader?: Profile;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown> | null;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  status: ArticleStatus;
  is_featured: boolean;
}

export const CATEGORIES = [
  "Campus",
  "Culture",
  "Opinion",
  "Sports",
  "Tech",
  "Achievements",
  "Ladies Corner",
  "International Perspectives",
  "Poems",
  "Sketches & Paintings",
] as const;

export type Category = (typeof CATEGORIES)[number];

// --- Personnel types for Who is Who section ---

export type PersonnelRole =
  | "commandant"
  | "deputy_commandant"
  | "staff_officer"
  | "student_officer";

export type Division = "Manekshaw" | "Cariappa" | "Arjan" | "Pereira";

export const DIVISIONS: Division[] = [
  "Manekshaw",
  "Cariappa",
  "Arjan",
  "Pereira",
];

export interface Personnel {
  id: string;
  name: string;
  rank: string;
  designation: string;
  personnel_role: PersonnelRole;
  division?: Division;
  avatar_url: string | null;
  bio?: string;
  unit_or_regiment?: string;
  order: number;
  // Extended profile fields
  birthday?: string;
  spouse_name?: string;
  spouse_birthday?: string;
  anniversary?: string;
  whatsapp_no?: string;
  email?: string;
}

// --- Alumni types ---

export type CareerDomain =
  | "military"
  | "defense_government"
  | "corporate"
  | "academic"
  | "entrepreneurship";

export interface Alumni {
  id: string;
  name: string;
  batch_year: number;
  current_role: string;
  organization: string;
  career_domain: CareerDomain;
  location: string;
  avatar_url: string | null;
  quote: string;
  bio: string;
  is_featured: boolean;
}

// --- Campus Map types ---

export type LocationIconType =
  | "building"
  | "field"
  | "residential"
  | "recreation"
  | "gate"
  | "medical";

export interface CampusLocation {
  id: string;
  name: string;
  description: string;
  fun_fact?: string;
  x: number;
  y: number;
  icon_type: LocationIconType;
}

// --- Image Optimization types ---

export interface ImageOptimizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: "jpeg" | "webp";
}

export interface ImageOptimizeResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
}

// --- Author Profile types ---

export interface AuthorProfile {
  id: string;
  user_id: string;
  display_name: string;
  short_bio: string;
  full_bio: string;
  avatar_url: string | null;
  batch: string;
  division: string;
  social_links: { twitter?: string; linkedin?: string; instagram?: string };
  created_at: string;
  updated_at: string;
}

// --- Review Workflow types ---

export type ReviewCommentType = "suggestion" | "required_change" | "approval";

export interface ReviewComment {
  id: string;
  article_id: string;
  author_id: string;
  author_name: string;
  type: ReviewCommentType;
  content: string;
  created_at: string;
  resolved: boolean;
}

export type ReviewAction = "approve" | "reject" | "request_changes";

export interface ReviewDecision {
  article_id: string;
  action: ReviewAction;
  reason: string;
  decided_by: string;
  decided_at: string;
}

// --- Photo Gallery types ---

export type GalleryCategory = "Ceremonies" | "CAPSTAR" | "Cultural" | "Social" | "Guest Lectures" | "Sports" | "Campus" | "Adventures" | "Families" | "Creative" | "Memes";

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  type: "image" | "video";
  url?: string;
  thumbnail?: string;
  aspect_ratio: "portrait" | "landscape" | "square";
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  sort_order?: number;
}

// --- Submission Portal types ---

export type SubmissionType = "article" | "photo" | "poem" | "sketch" | "meme";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type ContributorType = "officer" | "family";

export interface Submission {
  id: string;
  type: SubmissionType;
  category: string;
  title: string;
  author_name: string;
  author_email: string;
  author_division?: string;
  contributor_type: ContributorType;
  relation?: string; // e.g. "wife of", "son of"
  officer_name?: string; // related officer's name (for family)
  content: string;
  attachment_url?: string;
  status: SubmissionStatus;
  reviewer_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  article_id?: string;
}

// --- Table of Contents types ---

export interface TocEntry {
  id: string;
  title: string;
  page_label: string;
  category: string;
  slug?: string;
  /** Anchor or path link for section-type entries (e.g. "#gallery") */
  href?: string;
  type: "article" | "section" | "feature" | "poem";
  author?: string;
}
