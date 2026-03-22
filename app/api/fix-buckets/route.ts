import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

/**
 * POST /api/fix-buckets — One-time utility to ensure all storage buckets are public.
 * Private buckets cause getPublicUrl() to return URLs that 403, making images disappear.
 */
export async function POST() {
  try {
    const supabase = createServiceRoleClient();

    const buckets = ["submission-attachments", "article-covers", "media", "personnel-photos"];
    const results: Record<string, string> = {};

    for (const bucket of buckets) {
      // Try to create the bucket (no-ops if already exists)
      await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024,
      });

      // Update existing bucket to ensure it's public
      const { error } = await supabase.storage.updateBucket(bucket, {
        public: true,
      });

      results[bucket] = error ? `Error: ${error.message}` : "OK - set to public";
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Fix buckets error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
