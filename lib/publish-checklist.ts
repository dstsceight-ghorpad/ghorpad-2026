import { CATEGORIES } from "@/types";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  check: "auto" | "manual";
  required: boolean;
}

export interface ChecklistResult {
  item: ChecklistItem;
  passed: boolean;
  message?: string;
}

export const PUBLISH_CHECKLIST: ChecklistItem[] = [
  {
    id: "title",
    label: "Title is finalized",
    description: "Title should be between 10 and 200 characters",
    check: "auto",
    required: true,
  },
  {
    id: "excerpt",
    label: "Excerpt is written",
    description: "A brief summary under 200 characters",
    check: "auto",
    required: true,
  },
  {
    id: "cover",
    label: "Cover image is uploaded",
    description: "Articles should have a visual cover",
    check: "auto",
    required: false,
  },
  {
    id: "category",
    label: "Category is selected",
    description: "Ensure the correct category is chosen",
    check: "auto",
    required: true,
  },
  {
    id: "content_reviewed",
    label: "Content has been reviewed",
    description: "Confirm you have proofread the article",
    check: "manual",
    required: true,
  },
  {
    id: "tags",
    label: "Tags are added",
    description: "Add relevant tags for discoverability",
    check: "auto",
    required: false,
  },
  {
    id: "author",
    label: "Author attribution is correct",
    description: "Verify the author name and profile",
    check: "manual",
    required: true,
  },
];

interface FormData {
  title: string;
  excerpt: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
  content: Record<string, unknown> | null;
}

export function runAutoChecks(formData: FormData): ChecklistResult[] {
  return PUBLISH_CHECKLIST.map((item) => {
    if (item.check === "manual") {
      return { item, passed: false }; // Manual items start unchecked
    }

    switch (item.id) {
      case "title":
        return {
          item,
          passed:
            formData.title.length >= 10 && formData.title.length <= 200,
          message:
            formData.title.length < 10
              ? `Title is too short (${formData.title.length} chars)`
              : formData.title.length > 200
              ? `Title is too long (${formData.title.length} chars)`
              : undefined,
        };
      case "excerpt":
        return {
          item,
          passed:
            formData.excerpt.length > 0 && formData.excerpt.length <= 200,
          message:
            formData.excerpt.length === 0
              ? "Excerpt is empty"
              : formData.excerpt.length > 200
              ? `Excerpt too long (${formData.excerpt.length} chars)`
              : undefined,
        };
      case "cover":
        return {
          item,
          passed: !!formData.coverImageUrl,
          message: !formData.coverImageUrl ? "No cover image" : undefined,
        };
      case "category":
        return {
          item,
          passed: (CATEGORIES as readonly string[]).includes(formData.category),
        };
      case "tags":
        return {
          item,
          passed: formData.tags.length > 0,
          message: formData.tags.length === 0 ? "No tags added" : undefined,
        };
      default:
        return { item, passed: true };
    }
  });
}

export function canPublishChecklist(results: ChecklistResult[]): boolean {
  return results.every((r) => !r.item.required || r.passed);
}
