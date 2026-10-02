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
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-3">
        <History className="size-8 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">No verification transitions recorded yet</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Verification history will appear after new evidence is submitted and re-evaluated through practical tasks.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="text-xs h-8">
          <Link href="/tasks">
            <Sparkles className="size-3.5 mr-1.5 text-emerald-400" />
            Explore Micro-Tasks
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">Verification History & Proof Transitions</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {timeline.length} {timeline.length === 1 ? "re-verification event" : "re-verification events"}
        </span>
      </div>

      <div className="space-y-4">
        {timeline.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-lg border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.04] to-background/50 p-4 space-y-3 text-xs"
          >
            {/* Header: Skill and Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{item.skill}</span>
                <span className="text-muted-foreground">·</span>
                <a
                  href={item.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  {item.repositoryUrl.replace("https://github.com/", "")}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <span className="text-[11px] text-muted-foreground">
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
              <div className="p-2.5 rounded bg-background/60 border border-border/40">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-1">
                  Previous State
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">{item.previousStatus}</span>
                  <span className="font-mono text-muted-foreground">{item.previousScore}/100</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                  Updated State
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300">{item.newStatus}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-foreground">{item.newScore}/100</span>
                    {item.scoreDelta > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                        +{item.scoreDelta}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanations */}
            {item.reasons.length > 0 && (
              <div className="p-2.5 rounded bg-background/50 border border-border/40 text-muted-foreground leading-relaxed space-y-1">
                <strong className="text-foreground text-[11px] block">Deterministic Verification Change:</strong>
                {item.reasons.map((r, rIdx) => (
                  <div key={rIdx}>• {r}</div>
                ))}
              </div>
            )}

            {/* Newly Discovered Evidence */}
            {item.newEvidence.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                  Newly Discovered Technical Evidence ({item.newEvidence.length}):
                </span>
                <div className="space-y-1 pl-2 border-l border-emerald-500/40">
                  {item.newEvidence.map((ev, evIdx) => (
                    <div key={ev.id || evIdx} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground/90">• {ev.extractedFact}</span>
                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline shrink-0 ml-2"
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
