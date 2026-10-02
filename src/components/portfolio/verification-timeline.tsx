"use client";

import Link from "next/link";
import {
  ExternalLink,
  History,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VerificationTimelineEntry } from "@/lib/portfolio/types";

interface VerificationTimelineProps {
  timeline: VerificationTimelineEntry[];
}

export function VerificationTimeline({ timeline }: VerificationTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E7DCD1] bg-white p-8 text-center space-y-3">
        <History className="size-8 text-[#756B64] mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#241914]">No verification transitions recorded yet</p>
          <p className="text-xs text-[#756B64] max-w-md mx-auto">
            Verification history will appear after new evidence is submitted and re-evaluated through practical tasks.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="text-xs font-semibold h-9 border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl">
          <Link href="/tasks">
            <Sparkles className="size-3.5 mr-1.5 text-[#A95F3D]" />
            Explore Micro-Tasks
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-[#A95F3D]" />
          <h3 className="text-sm font-bold text-[#241914]">Verification History & Proof Transitions</h3>
        </div>
        <span className="text-xs text-[#756B64]">
          {timeline.length} {timeline.length === 1 ? "re-verification event" : "re-verification events"}
        </span>
      </div>

      <div className="space-y-4">
        {timeline.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-xl border border-[#2E8B57]/30 bg-[#E3F3E8]/30 p-5 space-y-3.5 text-xs shadow-2xs"
          >
            {/* Header: Skill and Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7DCD1] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#241914]">{item.skill}</span>
                <span className="text-[#E7DCD1]">·</span>
                <a
                  href={item.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#A95F3D] hover:underline inline-flex items-center gap-1 font-mono text-[11px] font-bold"
                >
                  {item.repositoryUrl.replace("https://github.com/", "")}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <span className="text-[11px] text-[#756B64] font-mono">
                {new Date(item.timestamp).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Before vs After comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white border border-[#E7DCD1]">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#756B64] block mb-1">
                  Previous State
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#756B64]">{item.previousStatus}</span>
                  <span className="font-mono text-[#756B64] font-semibold">{item.previousScore}/100</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#2E8B57]/30">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#2E8B57] block mb-1">
                  Updated State
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2E8B57]">{item.newStatus}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#241914]">{item.newScore}/100</span>
                    {item.scoreDelta > 0 && (
                      <span className="text-[10px] font-bold text-[#2E8B57] bg-[#E3F3E8] px-1.5 py-0.5 rounded">
                        +{item.scoreDelta}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanations */}
            {item.reasons.length > 0 && (
              <div className="p-3 rounded-lg bg-white border border-[#E7DCD1] text-[#756B64] leading-relaxed space-y-1">
                <strong className="text-[#241914] text-[11px] block">Deterministic Verification Change:</strong>
                {item.reasons.map((r, rIdx) => (
                  <div key={rIdx}>• {r}</div>
                ))}
              </div>
            )}

            {/* Newly Discovered Evidence */}
            {item.newEvidence.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#241914] uppercase tracking-wider block">
                  Newly Discovered Technical Evidence ({item.newEvidence.length}):
                </span>
                <div className="space-y-1 pl-3 border-l-2 border-[#2E8B57]">
                  {item.newEvidence.map((ev, evIdx) => (
                    <div key={ev.id || evIdx} className="flex items-center justify-between text-[11px]">
                      <span className="text-[#241914] font-medium">• {ev.extractedFact}</span>
                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A95F3D] hover:underline shrink-0 ml-2 font-semibold"
                        >
                          View Source
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
