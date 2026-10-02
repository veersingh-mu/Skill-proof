"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, ExternalLink, RefreshCw, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateHeaderProps {
  candidateName: string;
  githubUsername: string;
  analyzedAt: string;
  onResetSession?: () => void;
  isSampleSession?: boolean;
}

export function CandidateHeader({
  candidateName,
  githubUsername,
  analyzedAt,
  onResetSession,
  isSampleSession,
}: CandidateHeaderProps) {
  const formattedDate = (() => {
    try {
      return new Date(analyzedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return analyzedAt;
    }
  })();

  const cleanUsername = githubUsername.replace(/^@/, "");

  return (
    <header className="rounded-2xl border border-[#E7DCD1] bg-white p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-[#2E8B57]/30 bg-[#E3F3E8] text-[#2E8B57]">
              <UserCheck className="size-3.5" />
              Verified Candidate Profile
            </span>
            {isSampleSession && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-[#A95F3D]/25 bg-[#F4E2D3] text-[#A95F3D]">
                Live Verification Reference
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#241914] uppercase break-words">
            {candidateName || "Candidate"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs md:text-sm text-[#756B64] pt-0.5">
            <a
              href={`https://github.com/${cleanUsername}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[#241914] hover:text-[#A95F3D] font-mono font-bold transition-colors break-all"
            >
              <svg className="size-3.5 fill-current text-[#756B64] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              @{cleanUsername}
              <ExternalLink className="size-3 text-[#756B64] shrink-0" />
            </a>

            <span className="hidden sm:inline text-[#E7DCD1]">•</span>

            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-[#756B64] shrink-0" />
              Analyzed: {formattedDate}
            </span>

            <span className="hidden sm:inline text-[#E7DCD1]">•</span>

            <span className="text-[#2E8B57] font-semibold">
              Evidence-based technical skill verification
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onResetSession && !isSampleSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetSession}
              className="text-xs font-semibold border-[#E7DCD1] bg-white hover:bg-[#FAF7F2] text-[#241914] rounded-xl"
            >
              <RefreshCw className="size-3.5 mr-1.5 text-[#756B64]" />
              Clear Active Session
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold border-[#E7DCD1] bg-white hover:bg-[#FAF7F2] text-[#241914] rounded-xl"
          >
            <Link href="/analyze">
              <ArrowLeft className="size-3.5 mr-1.5" />
              Analyze Another Resume
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
