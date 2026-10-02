import { CheckCircle2, CircleAlert, FileCode2, GitBranch, ArrowDown, ShieldCheck, Sparkles, Terminal } from "lucide-react";

export function EvidencePreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-lg rounded-2xl border border-border/90 bg-card/90 p-3.5 sm:p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur-md min-w-0 box-border">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border/80 pb-3 sm:pb-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="size-4 shrink-0" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground uppercase truncate">
              Skill Verification
            </p>
            <h3 className="text-sm font-bold tracking-tight text-foreground truncate">Docker</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300 uppercase whitespace-nowrap">
            Sample Verification
          </span>
        </div>
      </div>

      {/* Initial State: PARTIAL 50 */}
      <div className="mt-3.5 sm:mt-4 rounded-xl border border-border/70 bg-background/60 p-3 sm:p-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300 shrink-0">
            <CircleAlert className="size-3.5 shrink-0" /> PARTIAL
          </span>
          <span className="font-mono text-xs font-bold text-muted-foreground shrink-0">
            Score: <span className="text-amber-300 font-semibold">50</span> / 100
          </span>
        </div>

        <p className="mt-2.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Observed Initial Evidence
        </p>
        <div className="mt-2 space-y-1.5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs rounded-lg border border-border/50 bg-secondary/30 p-2 sm:px-3 sm:py-1.5 font-mono text-zinc-300 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <FileCode2 className="size-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Dockerfile</span>
            </span>
            <span className="text-[11px] text-muted-foreground sm:shrink-0 truncate sm:text-right pl-5 sm:pl-0">
              user/cloud-api
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs rounded-lg border border-border/50 bg-secondary/30 p-2 sm:px-3 sm:py-1.5 font-mono text-zinc-300 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <Terminal className="size-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Container configuration</span>
            </span>
            <span className="text-[11px] text-muted-foreground sm:shrink-0 truncate sm:text-right pl-5 sm:pl-0">
              .dockerignore
            </span>
          </div>
        </div>
      </div>

      {/* Transition Divider: Micro-Task Completed & Pushed */}
      <div className="my-2.5 sm:my-3 flex items-center justify-center gap-2 sm:gap-3 text-xs text-muted-foreground min-w-0">
        <div className="h-px flex-1 bg-border/80 min-w-[8px]" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-indigo-300 text-center shrink-0">
          <Sparkles className="size-3 text-indigo-400 shrink-0" />
          <span>Practical Task Completed</span>
          <ArrowDown className="size-3 shrink-0" />
        </span>
        <div className="h-px flex-1 bg-border/80 min-w-[8px]" />
      </div>

      {/* New GitHub Evidence Added */}
      <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/20 p-3 sm:p-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
          <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[10px] sm:text-[11px] min-w-0">
            New GitHub Evidence Detected
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-emerald-400 font-semibold shrink-0">
            <GitBranch className="size-3 shrink-0" /> +2 new signals
          </span>
        </div>
        <div className="mt-2 space-y-1.5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs rounded-lg border border-emerald-500/25 bg-emerald-500/[0.05] p-2 sm:px-3 sm:py-1.5 font-mono text-emerald-200 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">+ Docker Compose</span>
            </span>
            <span className="text-[11px] text-muted-foreground sm:shrink-0 truncate sm:text-right pl-5 sm:pl-0">
              docker-compose.prod.yml
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs rounded-lg border border-emerald-500/25 bg-emerald-500/[0.05] p-2 sm:px-3 sm:py-1.5 font-mono text-emerald-200 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">+ CI/CD Workflow</span>
            </span>
            <span className="text-[11px] text-muted-foreground sm:shrink-0 truncate sm:text-right pl-5 sm:pl-0">
              workflows/docker.yml
            </span>
          </div>
        </div>
      </div>

      {/* Deterministic Re-verification Result: PROVEN 78 */}
      <div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08] p-3 sm:p-4 min-w-0">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Deterministic Re-verification
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400 text-zinc-950 px-2 py-0.5 text-xs font-bold shrink-0">
              PROVEN
            </span>
            <span className="text-xs text-muted-foreground">
              Criteria fully satisfied
            </span>
          </div>
        </div>
        <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-1 sm:gap-0 sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-500/20 shrink-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-emerald-400">78</span>
            <span className="font-mono text-xs text-muted-foreground">/ 100</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-emerald-400">
            +28 score delta
          </span>
        </div>
      </div>

      {!compact && (
        <p className="mt-3 text-center text-[10px] sm:text-[11px] text-muted-foreground break-words px-1">
          Observable proof engine • Deterministic re-verification based on code artifacts
        </p>
      )}
    </div>
  );
}
