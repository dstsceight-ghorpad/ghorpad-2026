"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, X, Search, Check, Send, Loader2 } from "lucide-react";
import type { Personnel, Division } from "@/types";

const DIVISIONS: Division[] = ["Manekshaw", "Cariappa", "Arjan", "Pereira"];

type Step = "closed" | "select" | "describe" | "done";

export default function ReportIssue() {
  const [step, setStep] = useState<Step>("closed");
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selection state
  const [activeDivision, setActiveDivision] = useState<Division>("Manekshaw");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);

  // Form state
  const [reporterName, setReporterName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch personnel when modal opens
  useEffect(() => {
    if (step === "select" && personnel.length === 0) {
      setLoading(true);
      fetch("/api/personnel")
        .then((res) => res.json())
        .then((data) => {
          const students = (data as Personnel[]).filter(
            (p) => p.personnel_role === "student_officer"
          );
          setPersonnel(students);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [step, personnel.length]);

  const filtered = useMemo(() => {
    return personnel
      .filter((p) => p.division === activeDivision)
      .filter((p) =>
        searchQuery
          ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [personnel, activeDivision, searchQuery]);

  const handleOpen = () => {
    setStep("select");
    setSelectedPerson(null);
    setDescription("");
    setReporterName("");
    setSearchQuery("");
  };

  const handleSelectPerson = (person: Personnel) => {
    setSelectedPerson(person);
    setStep("describe");
  };

  const handleSubmit = async () => {
    if (!selectedPerson || !description.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personnel_id: selectedPerson.id,
          personnel_name: `${selectedPerson.rank} ${selectedPerson.name}`,
          division: selectedPerson.division,
          reporter_name: reporterName.trim() || "Anonymous",
          description: description.trim(),
        }),
      });

      if (res.ok) {
        setStep("done");
      } else {
        const err = await res.json();
        alert("Failed to submit: " + (err.error || "Unknown error"));
      }
    } catch {
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("closed");
    setSelectedPerson(null);
    setDescription("");
    setReporterName("");
    setSearchQuery("");
  };

  // Floating button
  if (step === "closed") {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-red-500/90 hover:bg-red-500 text-white font-mono text-xs px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
        title="Report an issue with profile information"
      >
        <AlertCircle size={16} />
        <span className="hidden sm:inline">REPORT ISSUE</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-surface border border-border-subtle rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <h2 className="font-serif text-lg font-bold">
              {step === "select" && "Select Your Profile"}
              {step === "describe" && "Report Issue"}
              {step === "done" && "Thank You!"}
            </h2>
            <p className="font-mono text-[10px] text-muted mt-0.5">
              {step === "select" && "Choose your name from the list below"}
              {step === "describe" &&
                `${selectedPerson?.rank} ${selectedPerson?.name}`}
              {step === "done" && "Your feedback has been recorded"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-muted hover:text-foreground hover:bg-surface-light transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Select officer */}
        {step === "select" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Division tabs */}
            <div className="flex gap-2 px-5 py-3 border-b border-border-subtle">
              {DIVISIONS.map((div) => (
                <button
                  key={div}
                  onClick={() => {
                    setActiveDivision(div);
                    setSearchQuery("");
                  }}
                  className={`font-mono text-[10px] px-3 py-1.5 rounded transition-all ${
                    activeDivision === div
                      ? "bg-gold text-background font-semibold"
                      : "text-muted border border-border-subtle hover:border-gold/40"
                  }`}
                >
                  {div.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="px-5 py-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full bg-surface-light border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm focus:border-gold/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Officer list */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-gold" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted text-sm py-8">
                  No officers found.
                </p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleSelectPerson(person)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-surface-light transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <span className="font-mono text-[10px] text-gold font-bold">
                          {person.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {person.rank} {person.name}
                        </p>
                        <p className="font-mono text-[9px] text-muted">
                          {person.service || "Student Officer"}
                        </p>
                      </div>
                      <span className="font-mono text-[9px] text-muted/40 group-hover:text-gold transition-colors">
                        SELECT
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Describe issue */}
        {step === "describe" && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gold/5 border border-gold/20 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Check size={18} className="text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {selectedPerson?.rank} {selectedPerson?.name}
                </p>
                <p className="font-mono text-[9px] text-muted">
                  {selectedPerson?.division} Division
                </p>
              </div>
              <button
                onClick={() => setStep("select")}
                className="ml-auto font-mono text-[9px] text-gold hover:underline"
              >
                CHANGE
              </button>
            </div>

            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                YOUR NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Maj Arjun Singh"
                className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-gold/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
                DESCRIBE THE ISSUE *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Birthday is incorrect — should be 15 Mar not 10 Nov. Spouse name spelling needs correction..."
                rows={4}
                className="w-full bg-surface-light border border-border-subtle rounded-lg px-3 py-2 text-sm resize-none focus:border-gold/50 focus:outline-none"
              />
              <p className="font-mono text-[9px] text-muted mt-1">
                {description.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("select")}
                className="flex-1 font-mono text-xs text-muted border border-border-subtle py-2.5 rounded-lg hover:border-gold/40 transition-colors"
              >
                BACK
              </button>
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || submitting}
                className="flex-1 flex items-center justify-center gap-2 font-mono text-xs font-semibold bg-gold text-background py-2.5 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {submitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-400" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">
              Feedback Received!
            </h3>
            <p className="text-sm text-muted mb-6">
              Your correction request for{" "}
              <strong>
                {selectedPerson?.rank} {selectedPerson?.name}
              </strong>{" "}
              has been submitted. The editorial team will review and update it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleOpen}
                className="flex-1 font-mono text-xs text-gold border border-gold/30 py-2.5 rounded-lg hover:bg-gold/10 transition-colors"
              >
                REPORT ANOTHER
              </button>
              <button
                onClick={handleClose}
                className="flex-1 font-mono text-xs font-semibold bg-gold text-background py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
