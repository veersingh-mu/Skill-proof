"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CandidateModeBannerProps {
  isSample: boolean;
  githubUsername: string;
  candidateName?: string;
  showBackToDashboard?: boolean;
  pageContext?: "dashboard" | "evidence" | "jobs" | "portfolio" | "tasks";
}

/**
 * High-visibility banner communicating whether the current view is displaying
 * Reference/Demo Candidate data or Live Candidate Verification data.
 *
 * Implements the SkillProof warm cream/coffee/terracotta palette for reference mode,
 * and emerald green for live mode, with strong visual hierarchy and WCAG AA contrast.
 */
export function CandidateModeBanner({
  isSample,
  githubUsername,
  candidateName,
  showBackToDashboard = true,
  pageContext,
}: CandidateModeBannerProps) {
  const cleanUsername = (githubUsername || "pratyushwakde24-source").replace(/^@/, "");
  const isDashboard = pageContext === "dashboard";

  // REFERENCE CANDIDATE MODE (Warm Cream / Coffee / Terracotta)
  if (isSample) {
    return (
      <aside
        role="status"
        aria-label="Reference Candidate Mode Announcement"
        className="w-full rounded-2xl border border-[#D9A16F] bg-[#FFF4E8] p-4 sm:p-5 shadow-xs transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Icon + Content */}
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            {/* Circular icon container */}
            <div
              className="size-10 sm:size-11 rounded-full bg-[#F0D0B5] flex items-center justify-center shrink-0 border border-[#D9A16F]/40 shadow-xs"
              aria-hidden="true"
            >
              <UserCheck className="size-5 text-[#7A3E23]" />
            </div>

            {/* Text Hierarchy */}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#3A2117] uppercase">
                  REFERENCE CANDIDATE MODE
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F0D0B5] text-[#7A3E23] border border-[#D9A16F]/30">
                  <Sparkles className="size-2.5" /> Demo Data
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#3A2117] leading-relaxed break-words">
                Displaying reference verification data for{" "}
                <strong className="text-[#7A3E23] font-mono font-bold break-all">
                  @{cleanUsername}
                </strong>
                {candidateName ? ` (${candidateName})` : ""}.
              </p>

              <p className="text-[11px] sm:text-xs text-[#6B5146] leading-normal">
                Run your own analysis to generate live evidence from your GitHub repositories.
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0 pt-2 md:pt-0 border-t border-[#D9A16F]/20 md:border-t-0">
            {showBackToDashboard && !isDashboard && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-10 min-h-[40px] px-3.5 text-xs font-semibold border-[#D9A16F] text-[#6D351F] hover:bg-[#F0D0B5]/50 hover:text-[#542817] rounded-xl transition-colors cursor-pointer"
              >
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            )}

            <Button
              asChild
              size="sm"
              className="h-10 min-h-[40px] px-4 text-xs sm:text-sm font-bold bg-[#6D351F] hover:bg-[#542817] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Link href="/analyze" className="inline-flex items-center justify-center gap-1.5">
                <span>Run My Analysis</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // LIVE MODE (Emerald Green Verification)
  return (
    <aside
      role="status"
      aria-label="Live Candidate Verification Announcement"
      className="w-full rounded-2xl border border-[#2E8B57]/30 bg-[#E3F3E8] p-4 sm:p-5 shadow-xs transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon + Content */}
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div
            className="size-10 sm:size-11 rounded-full bg-[#2E8B57]/15 flex items-center justify-center shrink-0 border border-[#2E8B57]/30 shadow-xs"
            aria-hidden="true"
          >
            <CheckCircle2 className="size-5 text-[#2E8B57]" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1B4D3E] uppercase">
                ✓ LIVE VERIFICATION
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#2E8B57]/15 text-[#2E8B57] border border-[#2E8B57]/30">
                Active Session
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#1B4D3E] leading-relaxed break-words">
              Showing evidence generated from your connected GitHub repositories for{" "}
              <strong className="text-[#2E8B57] font-mono font-bold break-all">
                @{cleanUsername}
              </strong>
              .
            </p>

            <p className="text-[11px] sm:text-xs text-[#2E8B57]/80 leading-normal">
              Deterministic verification active. Real commits, files, and workflows analyzed.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0 pt-2 md:pt-0 border-t border-[#2E8B57]/20 md:border-t-0">
          {showBackToDashboard && !isDashboard && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 min-h-[40px] px-3.5 text-xs font-semibold border-[#2E8B57]/40 text-[#1B4D3E] hover:bg-[#2E8B57]/10 rounded-xl transition-colors cursor-pointer"
            >
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          )}

          <Button
            asChild
            size="sm"
            className="h-10 min-h-[40px] px-4 text-xs sm:text-sm font-bold bg-[#2E8B57] hover:bg-[#246B43] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Link href="/analyze" className="inline-flex items-center justify-center gap-1.5">
              <span>Run New Analysis</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
