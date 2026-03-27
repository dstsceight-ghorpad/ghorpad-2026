import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { generateSlug, estimateReadTime } from "@/lib/utils";
import { parsePlainText } from "@/lib/article-parser";

/**
 * Build TipTap JSON content from a submission's text and/or attachment.
 */
function buildArticleContent(
  text: string | undefined,
  attachmentUrl: string | undefined,
  isImage: boolean
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any[] = [];

  // For image attachments, skip adding to content — they'll be shown via cover_image_url
  // This prevents the same image from appearing twice (once as cover, once in content)

  // Embed PDF directly if attachment is a PDF
  const isPdf = /\.pdf$/i.test(attachmentUrl || "");
  if (attachmentUrl && isPdf) {
    nodes.push({
      type: "pdf",
      attrs: { src: attachmentUrl, title: text || "Document" },
    });
  }

  // Add download link if attachment is a Word doc
  const isDoc = /\.(doc|docx)$/i.test(attachmentUrl || "");
  if (attachmentUrl && isDoc) {
    nodes.push({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Download Document",
          marks: [{ type: "link", attrs: { href: attachmentUrl, target: "_blank" } }],
        },
      ],
    });
  }

  // Add text content
  if (text && !text.startsWith("[See attached file:")) {
    const parsed = parsePlainText(text);
    nodes.push(...parsed.content);
  }

  // Fallback: at least one empty paragraph
  if (nodes.length === 0) {
    nodes.push({ type: "paragraph" });
  }

  return { type: "doc", content: nodes };
}

/**
 * Map a submission's type + category to an article category.
 */
function mapCategory(submissionType: string, submissionCategory: string): string {
  if (submissionType === "poem") return "Poems";
  if (submissionType === "sketch") return "Sketches & Paintings";
  if (submissionType === "photo") return "Culture";
  // For articles, the submitter already chose from CATEGORIES
  return submissionCategory || "Campus";
}

/**
 * PATCH /api/submissions/[id] — Authenticated. Updates submission status.
 * When approved, automatically creates a draft article from the submission.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate auth
    const { createServerClient } = await import("@supabase/ssr");
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, reviewer_notes } = body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update the submission status
    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (reviewer_notes !== undefined) updateData.reviewer_notes = reviewer_notes;
    updateData.reviewed_at = new Date().toISOString();
    updateData.reviewed_by = user.email || user.id;

    const { error } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    // ── Auto-create draft article when approved ──────────────────────────
    let articleId: string | null = null;

    if (status === "approved") {
      // Fetch the full submission to build the article
      const { data: submission, error: fetchErr } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !submission) {
        console.error("Failed to fetch submission for article creation:", fetchErr);
        // Approval succeeded but article creation failed — still return success
        return NextResponse.json({ success: true, articleId: null });
      }

      // Determine if attachment is an image (check extension from URL)
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(submission.attachment_url || "");

      // Build article content
      const content = buildArticleContent(
        submission.content,
        submission.attachment_url,
        isImage
      );

      // Build contributor display name
      let contributorName = submission.author_name;
      if (submission.relation && submission.officer_name) {
        contributorName += ` (${submission.relation} ${submission.officer_name})`;
      }

      // Generate unique slug
      const baseSlug = generateSlug(submission.title);
      const slug = `${baseSlug}-${Date.now()}`;

      // Build excerpt
      const plainText = submission.content || "";
      const excerpt =
        plainText && !plainText.startsWith("[See attached file:")
          ? plainText.slice(0, 150).trim() + (plainText.length > 150 ? "…" : "")
          : `Contributed by ${submission.author_name}`;

      // Map category
      const category = mapCategory(submission.type, submission.category);

      // Calculate read time
      const readTime = estimateReadTime(content as Record<string, unknown>);

      // Create the draft article
      const { data: article, error: articleErr } = await supabase
        .from("articles")
        .insert({
          title: submission.title,
          slug,
          excerpt,
          content,
          cover_image_url: isImage ? submission.attachment_url : null,
          category,
          tags: ["contribution"],
          status: "draft",
          is_featured: false,
          author_id: user.id,
          contributor_name: contributorName,
          read_time_minutes: readTime,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (articleErr) {
        console.error("Failed to create draft article:", articleErr);
        // Approval succeeded but article creation failed
        return NextResponse.json({ success: true, articleId: null });
      }

      articleId = article.id;

      // Link the article back to the submission
      await supabase
        .from("submissions")
        .update({ article_id: articleId })
        .eq("id", id);
    }

    return NextResponse.json({ success: true, articleId });
  } catch (err) {
    console.error("Submissions PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/submissions/[id] — Authenticated. Deletes a submission.
 * If the submission has an associated article, deletes that too.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate auth
    const { createServerClient } = await import("@supabase/ssr");
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Fetch the submission to check for linked article
    const { data: submission } = await supabase
      .from("submissions")
      .select("article_id, attachment_url")
      .eq("id", id)
      .single();

    // Delete linked article if exists
    if (submission?.article_id) {
      await supabase.from("articles").delete().eq("id", submission.article_id);
    }

    // Delete the submission
    const { error } = await supabase.from("submissions").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submissions DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
