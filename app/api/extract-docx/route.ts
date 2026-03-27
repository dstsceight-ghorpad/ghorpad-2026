import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

/**
 * POST /api/extract-docx
 * Accepts { url: string } — downloads the docx and extracts text as TipTap-compatible content.
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    // Download the docx file
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to download document" }, { status: 400 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value.trim();

    if (!rawText) {
      return NextResponse.json({ error: "Document is empty" }, { status: 400 });
    }

    // Convert to TipTap JSON format — split by paragraphs
    const paragraphs = rawText.split(/\n\s*\n/).filter((p: string) => p.trim());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes: any[] = paragraphs.map((text: string) => ({
      type: "paragraph",
      content: [{ type: "text", text: text.trim() }],
    }));

    const content = { type: "doc", content: nodes.length > 0 ? nodes : [{ type: "paragraph" }] };

    // Also return plain text for excerpt generation
    const plainText = paragraphs.join("\n\n");

    return NextResponse.json({ content, plainText, wordCount: rawText.split(/\s+/).length });
  } catch (err) {
    console.error("Extract docx error:", err);
    return NextResponse.json({ error: "Failed to extract document content" }, { status: 500 });
  }
}
