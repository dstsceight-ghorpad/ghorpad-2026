/**
 * Article parsers — convert uploaded .txt / .md / .docx files into TipTap-compatible content.
 *
 * .txt  → TipTap JSON (paragraphs)
 * .md   → TipTap JSON (headings, bold, italic, links, lists, blockquotes, hr)
 * .docx → HTML string (via mammoth, loaded dynamically)
 */

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

type TipTapDoc = {
  type: "doc";
  content: TipTapNode[];
};

// ─── Inline Markdown → TipTap text nodes ────────────────────────────────────

function parseInlineMarkdown(line: string): TipTapNode[] {
  const nodes: TipTapNode[] = [];

  // Regex matches: **bold**, *italic*, [text](url), or plain text chunks
  const pattern =
    /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[([^\]]+)\]\(([^)]+)\))|([^*[\]]+)/g;

  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match[1]) {
      // **bold**
      nodes.push({
        type: "text",
        text: match[2],
        marks: [{ type: "bold" }],
      });
    } else if (match[3]) {
      // *italic*
      nodes.push({
        type: "text",
        text: match[4],
        marks: [{ type: "italic" }],
      });
    } else if (match[5]) {
      // [text](url)
      nodes.push({
        type: "text",
        text: match[6],
        marks: [{ type: "link", attrs: { href: match[7], target: "_blank" } }],
      });
    } else if (match[8]) {
      // plain text
      nodes.push({ type: "text", text: match[8] });
    }
  }

  return nodes;
}

// ─── Plain Text → TipTap JSON ───────────────────────────────────────────────

export function parsePlainText(text: string): TipTapDoc {
  const lines = text.split("\n");
  const content: TipTapNode[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      // Preserve empty lines as empty paragraphs
      content.push({ type: "paragraph" });
    } else {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: trimmed }],
      });
    }
  }

  // Ensure at least one node
  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }

  return { type: "doc", content };
}

// ─── Markdown → TipTap JSON ─────────────────────────────────────────────────

export function parseMarkdown(md: string): TipTapDoc {
  const lines = md.split("\n");
  const content: TipTapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line → empty paragraph
    if (trimmed === "") {
      content.push({ type: "paragraph" });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // Headings (# ## ###)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      content.push({
        type: "heading",
        attrs: { level },
        content: parseInlineMarkdown(text),
      });
      i++;
      continue;
    }

    // Blockquote (> ...)
    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: parseInlineMarkdown(quoteLines.join(" ")),
          },
        ],
      });
      continue;
    }

    // Unordered list (- or * at start)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: TipTapNode[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineMarkdown(itemText),
            },
          ],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    // Ordered list (1. 2. etc.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: TipTapNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineMarkdown(itemText),
            },
          ],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    // Regular paragraph
    content.push({
      type: "paragraph",
      content: parseInlineMarkdown(trimmed),
    });
    i++;
  }

  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }

  return { type: "doc", content };
}

// ─── DOCX → HTML (dynamic import of mammoth) ────────────────────────────────

export async function parseDocx(
  file: File
): Promise<{ html: string } | { error: string }> {
  try {
    // mammoth is an optional dependency — dynamically imported
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = await (Function('return import("mammoth")')() as Promise<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >);
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return { html: result.value };
  } catch {
    return {
      error:
        "Failed to parse .docx file. Make sure the mammoth package is installed (npm install mammoth).",
    };
  }
}

// ─── Detect file type and parse ──────────────────────────────────────────────

export type ParseResult =
  | { type: "json"; data: TipTapDoc }
  | { type: "html"; data: string }
  | { type: "error"; message: string };

export async function parseArticleFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    const text = await file.text();
    return { type: "json", data: parsePlainText(text) };
  }

  if (name.endsWith(".md") || name.endsWith(".markdown")) {
    const text = await file.text();
    return { type: "json", data: parseMarkdown(text) };
  }

  if (name.endsWith(".docx")) {
    const result = await parseDocx(file);
    if ("html" in result) {
      return { type: "html", data: result.html };
    }
    return { type: "error", message: result.error };
  }

  return {
    type: "error",
    message: `Unsupported file type. Please upload a .txt, .md, or .docx file.`,
  };
}
