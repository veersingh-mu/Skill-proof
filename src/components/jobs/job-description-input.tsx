"use client";

import { useState } from "react";
import { Briefcase, Sparkles, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_JD_LENGTH, MIN_JD_LENGTH } from "@/lib/jobs/schemas";

export const SAMPLE_JOB_FIXTURE = {
  title: "Full Stack Developer",
  description: `We are looking for a Full Stack Developer.

Required Skills:
- React
- Node.js
- TypeScript
- MongoDB

Preferred Skills:
- Docker
- AWS
- Python

The candidate should have experience building web applications,
REST APIs, frontend interfaces, databases and deploying applications.`,
};

interface JobDescriptionInputProps {
  onAnalyze: (title: string, description: string) => Promise<void> | void;
  isLoading: boolean;
}

export function JobDescriptionInput({ onAnalyze, isLoading }: JobDescriptionInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const charCount = description.trim().length;
  const isTooShort = charCount > 0 && charCount < MIN_JD_LENGTH;
  const isTooLong = charCount > MAX_JD_LENGTH;

  const handleLoadSample = () => {
    setTitle(SAMPLE_JOB_FIXTURE.title);
    setDescription(SAMPLE_JOB_FIXTURE.description);
    setValidationError(null);
  };

  const handleClear = () => {
    setTitle("");
    setDescription("");
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setValidationError("Please enter or paste a job description.");
      return;
    }
    if (trimmed.length < MIN_JD_LENGTH) {
      setValidationError(`Job description must be at least ${MIN_JD_LENGTH} characters.`);
      return;
    }
    if (trimmed.length > MAX_JD_LENGTH) {
      setValidationError(`Job description cannot exceed ${MAX_JD_LENGTH.toLocaleString()} characters.`);
      return;
    }

    setValidationError(null);
    onAnalyze(title.trim(), trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border/70 bg-card/60 p-5 sm:p-7 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
            <Briefcase className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Job Description Input</h2>
            <p className="text-xs text-muted-foreground">
              Paste any job post to extract technical requirements and match against verified candidate evidence.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLoadSample}
          className="text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 self-start sm:self-auto"
        >
          <Sparkles className="size-3.5 mr-1.5 text-emerald-400" />
          Load Sample Full-Stack JD
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="job-title" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Job Title (Optional)
          </label>
          <Input
            id="job-title"
            placeholder="e.g. Full Stack Developer, Senior React Engineer..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="text-sm bg-background/50 border-border/80"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="job-description" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Job Description Content *
            </label>
            <span
              className={`text-[11px] font-mono ${
                isTooLong ? "text-red-400 font-bold" : isTooShort ? "text-amber-400" : "text-muted-foreground"
              }`}
            >
              {charCount.toLocaleString()} / {MAX_JD_LENGTH.toLocaleString()} chars
            </span>
          </div>

          <Textarea
            id="job-description"
            placeholder={`Paste job description here...\n\nExample:\nRequired Skills:\n- React\n- Node.js\n- TypeScript\n\nPreferred Skills:\n- Docker\n- AWS`}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (validationError) setValidationError(null);
            }}
            className="min-h-52 font-mono text-xs leading-relaxed bg-background/50 border-border/80 resize-y"
          />
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-xs">
          {validationError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isLoading || !description.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs px-5 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 mr-2 animate-spin" />
                Analyzing Job Requirements...
              </>
            ) : (
              <>
                Analyze Job Description
                <ArrowRight className="size-3.5 ml-2" />
              </>
            )}
          </Button>

          {description && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Deterministic extraction based on SkillProof taxonomy. No AI scoring or hiring prediction.
        </p>
      </div>
    </form>
  );
}
