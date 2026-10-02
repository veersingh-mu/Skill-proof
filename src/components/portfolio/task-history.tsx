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
      <div className="rounded-2xl border border-dashed border-[#E7DCD1] bg-white p-8 text-center space-y-3">
        <Code2 className="size-8 text-[#756B64] mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#241914]">No completed verification tasks yet</p>
          <p className="text-xs text-[#756B64] max-w-md mx-auto">
            Practical AI micro-tasks allow you to build real projects on GitHub and turn skill gaps into factual proof.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="text-xs font-semibold h-9 border-[#E7DCD1] text-[#241914] hover:bg-[#FAF7F2] rounded-xl">
          <Link href="/tasks">
            <Sparkles className="size-3.5 mr-1.5 text-[#A95F3D]" />
            Explore Skill Gaps & Tasks
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-4">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-[#A95F3D]" />
          <h3 className="text-sm font-bold text-[#241914]">Completed Micro-Tasks</h3>
        </div>
        <span className="text-xs text-[#756B64]">
          {tasks.length} {tasks.length === 1 ? "task submitted" : "tasks submitted"}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DCD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#241914]">{task.title || `Practical Task: ${task.skill}`}</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F4E2D3] text-[#A95F3D] border border-[#E8C5B0]">
                  {task.skill}
                </span>
                <span className="text-[10px] font-mono text-[#756B64]">
                  {task.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#756B64]">
                <a
                  href={task.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#A95F3D] hover:underline inline-flex items-center gap-1 font-semibold"
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
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#756B64] block">
                  Outcome
                </span>
                <span className="font-bold text-[#241914]">
                  {task.previousStatus} → {task.newStatus}
                  {task.scoreDelta > 0 && (
                    <span className="text-[#2E8B57] ml-1">(+{task.scoreDelta})</span>
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
