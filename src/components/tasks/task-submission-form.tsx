"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function GitHubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface TaskSubmissionFormProps {
  skill: string;
  isAnalyzing: boolean;
  onSubmit: (repositoryUrl: string) => Promise<void>;
  errorMessage?: string | null;
}

export function TaskSubmissionForm({
  skill,
  isAnalyzing,
  onSubmit,
  errorMessage,
}: TaskSubmissionFormProps) {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Cycle loading steps during analysis
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1200);
    return () => {
      clearInterval(interval);
      setLoadingStep(0);
    };
  }, [isAnalyzing]);

  const loadingMessages = [
    "Analyzing repository...",
    "Comparing new evidence...",
    "Re-verifying skill...",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setLocalError("Please enter a GitHub repository URL.");
      return;
    }

    if (!trimmed.includes("github.com")) {
      setLocalError("Only public GitHub repositories (e.g. https://github.com/owner/repo) are supported.");
      return;
    }

    try {
      await onSubmit(trimmed);
    } catch {
      // Parent component handles and displays submission error
    }
  };

  const displayError = localError || errorMessage;

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-card/80 p-6 sm:p-8 space-y-6 shadow-xl shadow-indigo-950/20 backdrop-blur-sm">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-xs">
          <GitHubIcon className="size-6" />
        </span>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Show us the work.
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Submit the repository containing your completed task. SkillProof will inspect
          authentic code, configurations, and workflows to re-verify <strong className="text-foreground">{skill}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
        <div className="space-y-2">
          <label htmlFor="repo-url-input" className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            GitHub Repository URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <GitHubIcon className="size-4" />
              </span>
              <input
                id="repo-url-input"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (localError) setLocalError(null);
                }}
                disabled={isAnalyzing}
                placeholder="https://github.com/username/repository"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-colors disabled:opacity-50"
              />
            </div>
            <Button
              type="submit"
              disabled={isAnalyzing || !url.trim()}
              className="bg-indigo-600 text-white hover:bg-indigo-500 font-semibold text-xs h-11 px-6 shrink-0 shadow-sm shadow-indigo-600/30 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="size-3.5 mr-2 animate-spin text-white" />
                  <span>{loadingMessages[loadingStep]}</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 mr-2" />
                  Analyze Evidence
                </>
              )}
            </Button>
          </div>
        </div>

        {displayError && (
          <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1 leading-relaxed">{displayError}</div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
          <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
          <span>Factual, read-only analyzer. Zero hallucinations. Strict Phase 4 deterministic scoring.</span>
        </div>
      </form>
    </div>
  );
}
