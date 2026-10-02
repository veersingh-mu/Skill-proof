import { CheckCircle2, CircleAlert, FileCode2, GitBranch, ArrowDown, ShieldCheck, Sparkles, Terminal } from "lucide-react";

export function EvidencePreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-lg rounded-2xl border border-border/90 bg-card/90 p-5 sm:p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur-md">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Skill Verification
            </p>
            <h3 className="text-sm font-bold tracking-tight text-foreground">Docker</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300 uppercase">
            Sample Verification
          </span>
        </div>
      </div>

      {/* Initial State: PARTIAL 50 */}
      <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
            <CircleAlert className="size-3.5" /> PARTIAL
          </span>
          <span className="font-mono text-xs font-bold text-muted-foreground">
            Score: <span className="text-amber-300 font-semibold">50</span> / 100
          </span>
        </div>

        <p className="mt-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Observed Initial Evidence
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 font-mono text-zinc-300">
            <span className="flex items-center gap-2">
              <FileCode2 className="size-3.5 text-indigo-400" /> Dockerfile
            </span>
            <span className="text-[11px] text-muted-foreground">user/cloud-api</span>
          </div>
          <div className="flex items-center justify-between text-xs rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 font-mono text-zinc-300">
            <span className="flex items-center gap-2">
              <Terminal className="size-3.5 text-indigo-400" /> Container configuration
            </span>
            <span className="text-[11px] text-muted-foreground">.dockerignore</span>
          </div>
        </div>
      </div>

      {/* Transition Divider: Micro-Task Completed & Pushed */}
      <div className="my-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border/80" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-300">
          <Sparkles className="size-3 text-indigo-400" />
          Practical Micro-Task Completed
          <ArrowDown className="size-3" />
        </span>
        <div className="h-px flex-1 bg-border/80" />
      </div>

      {/* New GitHub Evidence Added */}
      <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/20 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[11px]">
            New GitHub Evidence Detected
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 font-semibold">
            <GitBranch className="size-3" /> +2 new signals
          </span>
        </div>
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs rounded-lg border border-emerald-500/25 bg-emerald-500/[0.05] px-3 py-1.5 font-mono text-emerald-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-400" /> + Docker Compose
            </span>
            <span className="text-[11px] text-muted-foreground">docker-compose.prod.yml</span>
          </div>
          <div className="flex items-center justify-between text-xs rounded-lg border border-emerald-500/25 bg-emerald-500/[0.05] px-3 py-1.5 font-mono text-emerald-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-400" /> + CI/CD Workflow
            </span>
            <span className="text-[11px] text-muted-foreground">.github/workflows/docker.yml</span>
          </div>
        </div>
      </div>

      {/* Deterministic Re-verification Result: PROVEN 78 */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08] p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Deterministic Re-verification
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400 text-zinc-950 px-2 py-0.5 text-xs font-bold">
              PROVEN
            </span>
            <span className="text-xs text-muted-foreground">
              Criteria fully satisfied
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="font-mono text-2xl font-black text-emerald-400">78</span>
            <span className="font-mono text-xs text-muted-foreground">/ 100</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-emerald-400">
            +28 score delta
          </span>
        </div>
      </div>

      {!compact && (
        <p className="mt-3.5 text-center text-[11px] text-muted-foreground">
          Observable proof engine • Deterministic re-verification based on code artifacts
        </p>
      )}
    </div>
  );
}
