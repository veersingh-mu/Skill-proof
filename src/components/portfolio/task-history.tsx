"use client";

import Link from "next/link";
import { Code2, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TaskPortfolioItem } from "@/lib/portfolio/types";

interface TaskHistoryProps {
  tasks: TaskPortfolioItem[];
}

export function TaskHistory({ tasks }: TaskHistoryProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-3">
        <Code2 className="size-8 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">No completed verification tasks yet</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Practical AI micro-tasks allow you to build real projects on GitHub and turn skill gaps into factual proof.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="text-xs h-8">
          <Link href="/tasks">
            <Sparkles className="size-3.5 mr-1.5 text-emerald-400" />
            Explore Skill Gaps & Tasks
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">Completed Micro-Tasks</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? "task submitted" : "tasks submitted"}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3.5 rounded-lg bg-background/50 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{task.title || `Practical Task: ${task.skill}`}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {task.skill}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {task.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <a
                  href={task.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  {task.repositoryUrl.replace("https://github.com/", "")}
                  <ExternalLink className="size-3" />
                </a>
                <span>·</span>
                <span>Submitted {new Date(task.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Outcome
                </span>
                <span className="font-bold text-foreground">
                  {task.previousStatus} → {task.newStatus}
                  {task.scoreDelta > 0 && (
                    <span className="text-emerald-400 ml-1">(+{task.scoreDelta})</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
