"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  ImageIcon,
  Link as LinkIcon,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TipTapEditorProps {
  content: Record<string, unknown> | null;
  onChange: (content: Record<string, unknown>) => void;
}

/** Upload an image file to Supabase storage and insert as a proper URL (not base64) */
async function uploadAndInsertImage(
  file: File,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  view: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event?: any
) {
  try {
    const { createBrowserSupabaseClient } = await import("@/lib/supabase");
    const supabase = createBrowserSupabaseClient();
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `article-img-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(filename, file, { cacheControl: "86400", upsert: true });

    if (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed: " + error.message);
      return;
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(filename);
    const url = urlData.publicUrl;

    // Insert at drop position or at cursor
    const pos = event
      ? view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
      : view.state.selection.anchor;

    if (pos !== undefined) {
      const node = view.state.schema.nodes.image.create({ src: url });
      const tr = view.state.tr.insert(pos, node);
      view.dispatch(tr);
    }
  } catch (err) {
    console.error("Image upload error:", err);
    alert("Failed to upload image");
  }
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false }),
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-gold underline" },
      }),
      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
    ],
    content: content || { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: "prose-editorial min-h-[400px] p-4 focus:outline-none",
        spellcheck: "true",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false;
        const file = event.dataTransfer.files[0];
        if (!file.type.startsWith("image/")) return false;
        event.preventDefault();
        uploadAndInsertImage(file, view, event);
        return true;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) uploadAndInsertImage(file, view);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Track whether we're doing an external update to prevent feedback loops
  const isExternalUpdate = useRef(false);

  // Handle external content updates (e.g. from file upload)
  useEffect(() => {
    if (!editor || !content) return;

    // Check if content has __html key (DOCX parsed as HTML)
    const maybeHtml = content as Record<string, unknown>;
    if (maybeHtml.__html && typeof maybeHtml.__html === "string") {
      isExternalUpdate.current = true;
      editor.commands.setContent(maybeHtml.__html);
      // Notify parent with the parsed TipTap JSON
      onChange(editor.getJSON() as Record<string, unknown>);
      isExternalUpdate.current = false;
      return;
    }

    // For TipTap JSON content: only update if it differs from current editor content
    const currentJson = JSON.stringify(editor.getJSON());
    const newJson = JSON.stringify(content);
    if (currentJson !== newJson) {
      isExternalUpdate.current = true;
      editor.commands.setContent(content);
      isExternalUpdate.current = false;
    }
  }, [content, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded transition-colors",
        active
          ? "bg-gold/20 text-gold"
          : "text-muted hover:text-foreground hover:bg-surface-light"
      )}
    >
      {children}
    </button>
  );

  const addImage = () => {
    // Create a hidden file input to allow file upload
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await uploadAndInsertImage(file, editor.view);
      }
    };
    input.click();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border-subtle bg-surface-light">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-border-subtle mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-border-subtle mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-border-subtle mx-1" />

        <ToolbarButton onClick={addImage} title="Insert Image">
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} title="Insert Link">
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-border-subtle mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
