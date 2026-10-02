import { CheckCircle2, CircleAlert, FileCode2, FolderGit2, GitBranch, ShieldCheck, FileText, Layers } from "lucide-react";

export function EvidencePreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-xl min-w-0 box-border py-4">
      {/* Soft peach abstract background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F4E2D3] via-[#FAF1EA] to-[#E8C5B0]/40 rounded-3xl blur-2xl -z-10 transform -rotate-1 scale-105 opacity-80" />

      <div className="space-y-4">
        {/* TOP ROW: Card 1 (GitHub Repository) & Card 4 (New Evidence Detected) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: GitHub Repository */}
          <div className="rounded-2xl border border-[#E7DCD1] bg-white p-4 shadow-sm shadow-[#241914]/5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-[#F7EFE7] text-[#6D351F]">
                  <FolderGit2 className="size-3.5" />
                </span>
                <span className="text-xs font-bold text-[#241914] tracking-tight">GitHub Repository</span>
              </div>
              <span className="text-[10px] font-mono text-[#756B64] bg-[#F7EFE7] px-1.5 py-0.5 rounded border border-[#E7DCD1]">
                main
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#756B64] space-y-1.5 pl-1">
              <div className="flex items-center gap-1.5 text-[#241914]">
                <FileCode2 className="size-3 text-[#A95F3D]" />
                <span className="truncate">docker-compose.yml</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCode2 className="size-3 text-[#756B64]" />
                <span>app.py</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="size-3 text-[#756B64]" />
                <span>requirements.txt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="size-3 text-[#756B64]" />
                <span>README.md</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#756B64]">
                <Layers className="size-3 text-[#756B64]" />
                <span>src/</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#A95F3D] font-medium">
                <GitBranch className="size-3" />
                <span className="truncate">.github/workflows/</span>
              </div>
            </div>
          </div>

          {/* Card 4: New GitHub Evidence Detected */}
          <div className="rounded-2xl border border-[#A95F3D]/25 bg-[#FAF1EA] p-4 shadow-sm shadow-[#A95F3D]/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A95F3D]">
                  New GitHub Evidence Detected
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#2E8B57] font-bold bg-[#E3F3E8] border border-[#2E8B57]/30 px-2 py-0.5 rounded-full shrink-0">
                  <GitBranch className="size-3" /> +3 new signals
                </span>
              </div>
              <p className="text-xs text-[#756B64] mt-1.5">
                Observable technical proof extracted directly from repo files.
              </p>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-2 rounded-lg border border-[#2E8B57]/30 bg-white px-2.5 py-1.5 text-[#241914]">
                <CheckCircle2 className="size-3.5 text-[#2E8B57] shrink-0" />
                <span className="truncate">✓ Docker Compose</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#2E8B57]/30 bg-white px-2.5 py-1.5 text-[#241914]">
                <CheckCircle2 className="size-3.5 text-[#2E8B57] shrink-0" />
                <span className="truncate">✓ CI/CD Workflow</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Card 2 (Initial State) & Card 3 (Final Verified Skill) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 2: Initial Verification State (PARTIAL 50/100) */}
          <div className="rounded-2xl border border-[#E7DCD1] bg-white p-4 shadow-sm shadow-[#241914]/5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#756B64]">
                  Skill Verification
                </p>
                <h4 className="text-sm font-bold text-[#241914]">Docker</h4>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#D99125]/30 bg-[#FFF0D7] px-2 py-0.5 text-[10px] font-bold text-[#D99125]">
                <CircleAlert className="size-3" /> PARTIAL
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-[#756B64]">Initial Score</span>
              <span className="font-bold text-[#241914]">
                <strong className="text-[#D99125] text-sm">50</strong> / 100
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <p className="text-[10px] font-semibold text-[#756B64] uppercase tracking-wider">
                Observed Initial Evidence
              </p>
              <div className="space-y-1 font-mono text-[11px] text-[#241914]">
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="size-3 text-[#2E8B57]" />
                  <span>Dockerfile</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="size-3 text-[#2E8B57]" />
                  <span>Container configuration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Final Verified Skill (92/100) */}
          <div className="rounded-2xl border-2 border-[#2E8B57]/40 bg-white p-4 shadow-md shadow-[#2E8B57]/10 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E3F3E8] rounded-full blur-2xl -z-10 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#E3F3E8] text-[#2E8B57]">
                  <ShieldCheck className="size-3.5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E8B57]">
                    Verified Skill
                  </p>
                  <h4 className="text-sm font-bold text-[#241914]">Docker</h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono text-[#2E8B57]">92</span>
                <span className="text-xs font-mono text-[#756B64]"> / 100</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#241914]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#2E8B57] shrink-0" />
                <span>Dockerfile detected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#2E8B57] shrink-0" />
                <span>Container configuration found</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#2E8B57] shrink-0" />
                <span>CI/CD workflow verified</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7DCD1] flex items-center justify-between text-[11px] font-semibold">
              <span className="text-[#2E8B57] bg-[#E3F3E8] px-2 py-0.5 rounded-full">PROVEN VERIFIED</span>
              <span className="text-[#A95F3D] font-mono">+42 score delta</span>
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <p className="mt-3 text-center text-xs text-[#756B64]">
          Observable proof engine • Deterministic re-verification based on authentic code
        </p>
      )}
    </div>
  );
}
