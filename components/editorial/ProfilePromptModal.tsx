"use client";

import { UserCircle, X } from "lucide-react";
import Link from "next/link";
import { dismissProfilePrompt } from "@/lib/author-profile";

interface ProfilePromptModalProps {
  onClose: () => void;
}

export default function ProfilePromptModal({ onClose }: ProfilePromptModalProps) {
  const handleDismiss = () => {
    dismissProfilePrompt();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleDismiss}
    >
      <div
        className="bg-surface border border-border-subtle rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <h3 className="font-serif text-lg font-bold">Complete Your Profile</h3>
          <button
            onClick={handleDismiss}
            className="p-2 text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <UserCircle size={32} className="text-gold" />
          </div>
          <h4 className="font-serif text-base font-semibold mb-2">
            Set up your author profile
          </h4>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Add your photo, bio, and social links. Your profile will be displayed
            alongside your published articles.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/editorial/profile"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-gold text-background font-mono text-xs font-semibold px-4 py-3 rounded-lg hover:bg-gold/90 transition-colors"
            >
              <UserCircle size={14} />
              SET UP PROFILE
            </Link>
            <button
              onClick={handleDismiss}
              className="font-mono text-xs text-muted hover:text-foreground py-2 transition-colors"
            >
              MAYBE LATER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
