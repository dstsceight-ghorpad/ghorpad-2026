"use client";

import React from "react";

/**
 * Renders TipTap JSON content as React elements.
 * Supports: paragraphs, headings, blockquotes, lists, images, horizontal rules,
 * and inline marks (bold, italic, links, underline, strike, code).
 */

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

function renderMarks(
  text: string,
  marks?: { type: string; attrs?: Record<string, unknown> }[]
): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  let node: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        node = <strong>{node}</strong>;
        break;
      case "italic":
        node = <em>{node}</em>;
        break;
      case "underline":
        node = <u>{node}</u>;
        break;
      case "strike":
        node = <s>{node}</s>;
        break;
      case "code":
        node = (
          <code className="bg-surface-light px-1.5 py-0.5 rounded text-sm font-mono">
            {node}
          </code>
        );
        break;
      case "link":
        node = (
          <a
            href={mark.attrs?.href as string}
            target={mark.attrs?.target as string || "_blank"}
            rel="noopener noreferrer"
            className="text-gold hover:text-gold/80 underline transition-colors"
          >
            {node}
          </a>
        );
        break;
    }
  }

  return node;
}

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  // Text node
  if (node.type === "text") {
    return (
      <React.Fragment key={index}>
        {renderMarks(node.text || "", node.marks)}
      </React.Fragment>
    );
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;

    case "paragraph":
      if (!children || children.length === 0) {
        return <p key={index} className="mb-4">&nbsp;</p>;
      }
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {children}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) || 2;
      const sizes: Record<number, string> = {
        1: "text-3xl font-bold mt-10 mb-4",
        2: "text-2xl font-bold mt-8 mb-3",
        3: "text-xl font-semibold mt-6 mb-2",
      };
      const className = `font-serif ${sizes[level] || sizes[2]}`;
      if (level === 1) return <h1 key={index} className={className}>{children}</h1>;
      if (level === 3) return <h3 key={index} className={className}>{children}</h3>;
      return <h2 key={index} className={className}>{children}</h2>;
    }

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-2 border-gold/40 pl-5 my-6 italic text-foreground/80"
        >
          {children}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className="list-decimal pl-6 mb-4 space-y-1">
          {children}
        </ol>
      );

    case "listItem":
      return (
        <li key={index} className="leading-relaxed">
          {children}
        </li>
      );

    case "horizontalRule":
      return (
        <hr key={index} className="border-border-subtle my-8" />
      );

    case "image": {
      const imgSrc = String(node.attrs?.src || "");
      const imgAlt = String(node.attrs?.alt || "");
      const imgTitle = node.attrs?.title ? String(node.attrs.title) : null;
      return (
        <figure key={index} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt={imgAlt} className="w-full rounded-lg" />
          {imgTitle && (
            <figcaption className="font-mono text-xs text-muted mt-2 text-center">
              {imgTitle}
            </figcaption>
          )}
        </figure>
      );
    }

    case "pdf": {
      const pdfSrc = String(node.attrs?.src || "");
      const pdfTitle = node.attrs?.title ? String(node.attrs.title) : "Document";
      return (
        <div key={index} className="my-6">
          <iframe
            src={`${pdfSrc}#toolbar=1&navpanes=0`}
            title={pdfTitle}
            className="w-full rounded-lg border border-border-subtle"
            style={{ height: "80vh", minHeight: "600px" }}
          />
          <div className="flex items-center justify-center mt-3">
            <a
              href={pdfSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs text-gold hover:text-gold/80 transition-colors"
            >
              Open PDF in new tab &rarr;
            </a>
          </div>
        </div>
      );
    }

    case "codeBlock":
      return (
        <pre
          key={index}
          className="bg-surface-light border border-border-subtle rounded-lg p-4 overflow-x-auto my-4 font-mono text-sm"
        >
          <code>{children}</code>
        </pre>
      );

    default:
      // Fallback: render children if any
      if (children) return <div key={index}>{children}</div>;
      return null;
  }
}

interface TipTapRendererProps {
  content: Record<string, unknown> | null;
}

export default function TipTapRenderer({ content }: TipTapRendererProps) {
  if (!content) {
    return (
      <p className="text-muted italic">No content available.</p>
    );
  }

  return (
    <div className="prose-editorial">
      {renderNode(content as unknown as TipTapNode, 0)}
    </div>
  );
}
