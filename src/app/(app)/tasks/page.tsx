import { Suspense } from "react";
import { Bot, Code2, GitBranch, RefreshCw, Target } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TasksView } from "@/components/tasks/tasks-view";

const WORKFLOW_STEPS = [
  { step: "01", icon: Target, label: "Skill Gap", detail: "Identify a missing or weakly evidenced requirement from job analysis." },
  { step: "02", icon: Bot, label: "Practical Task", detail: "Generate a concrete, practical challenge designed for real technical artifacts." },
  { step: "03", icon: Code2, label: "Build", detail: "Complete the practical task and publish solution to a public GitHub repository." },
  { step: "04", icon: GitBranch, label: "GitHub Evidence", detail: "Factual commits, workflows, and configuration are automatically mined." },
  { step: "05", icon: RefreshCw, label: "Re-verify", detail: "Deterministic verification updates status based strictly on observable evidence." },
];

export default function TasksPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Practical Proof Loop"
        title="Practical Skill Tasks"
        description="Generate practical, evidence-building tasks from your detected skill gaps. Complete the work on GitHub, submit your repository, and watch SkillProof deterministically re-verify your skills."
      />

      <section className="mt-8 mb-10 overflow-x-auto">
        <div className="flex min-w-[780px] items-start justify-between gap-3 p-5 sm:p-6 rounded-2xl border border-[#E7DCD1] bg-white shadow-xs">
          {WORKFLOW_STEPS.map((item, index) => (
            <div key={item.step} className="flex flex-1 items-start gap-2">
              <div className="min-w-32 text-center">
                <div className="relative mx-auto size-12 flex items-center justify-center rounded-xl border border-[#E8C5B0] bg-[#F4E2D3] shadow-xs">
                  <item.icon className="size-5 text-[#A95F3D]" />
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-white border border-[#E7DCD1] px-1.5 text-[9px] font-mono font-bold text-[#A95F3D]">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-3 text-xs font-bold text-[#241914] tracking-tight">{item.label}</h3>
                <p className="mt-1 text-[11px] leading-4 text-[#756B64]">{item.detail}</p>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="mt-6 flex-1 border-t-2 border-dashed border-[#E7DCD1]" />
              )}
            </div>
          ))}
        </div>
      </section>

      <Suspense fallback={<div className="text-center py-12 text-xs text-[#756B64]">Loading tasks...</div>}>
        <TasksView />
      </Suspense>
    </AppShell>
  );
}