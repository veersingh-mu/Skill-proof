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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7DCD1] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-[#F4E2D3] p-2.5 text-[#A95F3D] border border-[#E8C5B0]">
            <Briefcase className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#241914]">Job Description Input</h2>
            <p className="text-xs text-[#756B64]">
              Paste any job post to extract technical requirements and match against verified candidate evidence.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLoadSample}
          className="text-xs font-semibold border-[#A95F3D]/30 text-[#A95F3D] hover:bg-[#F4E2D3]/50 rounded-xl self-start sm:self-auto"
        >
          <Sparkles className="size-3.5 mr-1.5 text-[#A95F3D]" />
          Load Sample Full-Stack JD
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="job-title" className="block text-xs font-bold text-[#756B64] uppercase tracking-wider mb-1.5">
            Job Title (Optional)
          </label>
          <Input
            id="job-title"
            placeholder="e.g. Full Stack Developer, Senior React Engineer..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="text-sm bg-[#FAF7F2] border-[#E7DCD1] text-[#241914] rounded-xl focus-visible:ring-[#A95F3D]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="job-description" className="block text-xs font-bold text-[#756B64] uppercase tracking-wider">
              Job Description Content *
            </label>
            <span
              className={`text-[11px] font-mono ${
                isTooLong ? "text-[#C94A4A] font-bold" : isTooShort ? "text-[#D99125]" : "text-[#756B64]"
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
            className="min-h-52 font-mono text-xs leading-relaxed bg-[#FAF7F2] border-[#E7DCD1] text-[#241914] resize-y rounded-xl focus-visible:ring-[#A95F3D]"
          />
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 rounded-xl border border-[#C94A4A]/30 bg-[#C94A4A]/10 text-[#C94A4A] text-xs font-medium">
          {validationError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Button
            type="submit"
            disabled={isLoading || !description.trim()}
            className="w-full sm:w-auto bg-[#A95F3D] hover:bg-[#8E4F32] text-white font-bold text-xs px-6 shadow-sm min-h-[44px] rounded-xl transition-all"
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
              className="text-xs text-[#756B64] hover:text-[#C94A4A] hover:bg-[#C94A4A]/10 rounded-xl min-h-[40px]"
            >
              <Trash2 className="size-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <p className="text-[11px] text-[#756B64] text-center sm:text-left">
          Deterministic extraction based on SkillProof taxonomy. No hallucinated scoring.
        </p>
      </div>
    </form>
  );
}
