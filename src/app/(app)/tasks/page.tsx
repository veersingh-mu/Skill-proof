import { Suspense } from "react";
import { Bot, Code2, GitBranch, RefreshCw, Target } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TasksView } from "@/components/tasks/tasks-view";

const WORKFLOW_STEPS = [
  { step: "01", icon: Target, label: "Skill Gap", detail: "Identify a missing or weakly evidenced requirement from job analysis." },
  { step: "02", icon: Bot, label: "Micro-Task", detail: "Generate a concrete, practical challenge designed for real technical artifacts." },
  { step: "03", icon: Code2, label: "Build", detail: "Complete the practical task and publish solution to a public GitHub repository." },
  { step: "04", icon: GitBranch, label: "GitHub Evidence", detail: "Factual commits, workflows, and configuration are automatically mined." },
  { step: "05", icon: RefreshCw, label: "Re-verify", detail: "Phase 4 deterministic verification updates status based strictly on evidence." },
];

export default function TasksPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Practical Proof Loop"
        title="Turn gaps into proof"
        description="Generate practical, evidence-building tasks from your detected skill gaps. Complete the work on GitHub, submit your repository, and watch SkillProof deterministically re-verify your skills."
      />

      <section className="mt-8 mb-10 overflow-x-auto">
        <div className="flex min-w-[780px] items-start justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-xs">
          {WORKFLOW_STEPS.map((item, index) => (
            <div key={item.step} className="flex flex-1 items-start gap-2">
              <div className="min-w-32 text-center">
                <div className="relative mx-auto size-11 flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 shadow-xs">
                  <item.icon className="size-5 text-indigo-400" />
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-secondary border border-border px-1 text-[9px] font-mono font-bold text-indigo-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-foreground tracking-tight">{item.label}</h3>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.detail}</p>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="mt-5 flex-1 border-t border-dashed border-border/70" />
              )}
            </div>
          ))}
        </div>
      </section>

      <Suspense fallback={<div className="text-center py-12 text-xs text-muted-foreground">Loading tasks...</div>}>
        <TasksView />
      </Suspense>
    </AppShell>
  );
}