import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileCode2,
  FileSearch,
  FileText,
  GitBranch,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { EvidencePreview } from "@/components/landing/evidence-preview";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileSearch,
    title: "Deep GitHub Evidence Mining",
    description:
      "Analyze repositories, source files, commits, dependencies, tests, documentation, and configuration to find verifiable technical proof.",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic Verification",
    description:
      "Every skill is classified strictly as Proven, Partial, or Claimed-only using observable Phase 4 evidence rules with no hallucinated scores.",
  },
  {
    icon: Network,
    title: "Interactive Evidence Graph",
    description:
      "Trace any verified skill from the candidate's initial claim directly to the repository, file path, and commit that proves it.",
  },
  {
    icon: BrainCircuit,
    title: "AI Micro-Tasks & Re-verification",
    description:
      "When evidence is missing, generate a practical technical task, push completed work to GitHub, and trigger deterministic re-verification.",
  },
];

const proofFlow = [
  {
    step: "01",
    label: "Resume Claim",
    description: "Extract declared technical skills from your resume.",
    icon: FileText,
  },
  {
    step: "02",
    label: "GitHub Evidence",
    description: "Mine authentic commits, files, dependencies & CI configurations.",
    icon: GitBranch,
  },
  {
    step: "03",
    label: "Verification",
    description: "Deterministic scoring against strict technical criteria.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    label: "Skill Proof",
    description: "Auditable portfolio and shareable verification report.",
    icon: CheckCircle2,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_65%)]" />
          <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
                <Sparkles className="size-3.5 text-indigo-400" />
                AI-POWERED SKILL VERIFICATION
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  SKILLPROOF
                </p>
                <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                  Don&apos;t just claim skills.{" "}
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
                    Prove them.
                  </span>
                </h1>
              </div>

              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                SkillProof turns resume claims into traceable technical evidence from real GitHub work.
                Eliminate resume exaggeration with deterministic verification.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm h-11 px-6 shadow-sm shadow-indigo-600/30"
                >
                  <Link href="/analyze">
                    Analyze My Skills
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-border bg-card/60 hover:bg-secondary text-foreground text-sm h-11 px-6"
                >
                  <Link href="/dashboard">Explore Demo</Link>
                </Button>
              </div>

              {/* Connected Flow Pill Nodes */}
              <div className="pt-6 border-t border-border/60">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">
                  Verification Lifecycle
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-lg border border-border/80 bg-secondary/40 px-2.5 py-1 font-mono text-zinc-300">
                    Resume Claim
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded-lg border border-border/80 bg-secondary/40 px-2.5 py-1 font-mono text-zinc-300">
                    GitHub Evidence
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 font-mono text-indigo-300 font-semibold">
                    Verification
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-emerald-300 font-semibold">
                    Skill Proof
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div>
              <EvidencePreview />
            </div>
          </div>
        </section>

        {/* Verification Architecture / Lifecycle Flow */}
        <section className="border-b border-border/60 bg-card/20 py-16 sm:py-20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
                Observable Pipeline
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                How technical proof is synthesized
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                SkillProof replaces self-reported claims with deterministic, repeatable GitHub analysis.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {proofFlow.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-xl border border-border/80 bg-card/60 p-5 backdrop-blur-xs transition-colors hover:border-border"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {item.step}
                    </span>
                    <item.icon className="size-4 text-muted-foreground" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {item.label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem vs SkillProof */}
        <section className="border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
                The Disconnect
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Resumes show claims. GitHub shows evidence.
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Anyone can list a buzzword on a CV. Traceability proves true familiarity.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {/* Traditional */}
              <div className="rounded-xl border border-border/80 bg-background/50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Traditional Resume
                  </span>
                  <span className="text-[11px] font-mono text-red-400">Untrusted Claims</span>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4 font-mono text-xs text-zinc-300 space-y-1.5">
                  <p>Skills: Python, React, Docker, AWS, Kubernetes</p>
                  <p className="text-[11px] text-muted-foreground italic">
                    (No commit history, no code references, no proof of production usage)
                  </p>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Recruiters and hiring managers spend days manually interviewing candidates to verify whether
                  skills listed on resumes represent actual experience or aspirational claims.
                </p>
              </div>

              {/* SkillProof */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    SkillProof Verification
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">Traceable Evidence</span>
                </div>
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.04] p-4 font-mono text-xs text-zinc-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Docker</span>
                    <span className="text-emerald-400 font-bold">PROVEN (78)</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground pl-3 border-l border-emerald-500/40 mt-1 space-y-0.5">
                    <p>↳ repo: acme/api • Dockerfile</p>
                    <p>↳ repo: acme/api • docker-compose.yml</p>
                    <p>↳ repo: acme/api • .github/workflows/deploy.yml</p>
                  </div>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Every skill score is computed from observable artifacts in public codebases. Inspect
                  the graph, verify the files, and trust the proof.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Traceable Features */}
        <section className="border-b border-border/60 bg-card/20 py-16 sm:py-20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
                Engine Architecture
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built for deep technical traceability
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Four distinct layers of factual validation designed to inspect real software engineering activity.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border/80 bg-card/60 p-6 transition-all hover:border-border hover:bg-card/80"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Evidence Graph CTA Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="space-y-4">
              <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
                Interactive Graph
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                See the evidence behind every claim.
              </h2>
              <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
                Explore an interactive node map linking candidates to extracted claims, skills, repositories,
                files, and verifiable commits.
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-9 px-4"
                >
                  <Link href="/evidence">
                    <Network className="size-3.5 mr-2" />
                    Open Evidence Graph
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/70 p-6 backdrop-blur-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs">
                <span className="font-semibold text-foreground">Trace Path Example</span>
                <span className="font-mono text-indigo-400 text-[11px]">Node Hierarchy</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="size-2 rounded-full bg-indigo-400" />
                  Candidate: Alex Rivera
                </div>
                <div className="ml-4 flex items-center gap-2 text-zinc-400 border-l border-border pl-3">
                  <FileText className="size-3 text-zinc-500" />
                  Claim: &quot;Docker & Containerization&quot;
                </div>
                <div className="ml-8 flex items-center gap-2 text-emerald-400 border-l border-border pl-3 font-semibold">
                  <CheckCircle2 className="size-3" />
                  Verified Skill: Docker (PROVEN)
                </div>
                <div className="ml-12 flex items-center gap-2 text-zinc-300 border-l border-border pl-3">
                  <GitBranch className="size-3 text-muted-foreground" />
                  Repo: alexrivera/cloud-service
                </div>
                <div className="ml-16 flex items-center gap-2 text-indigo-300 border-l border-border pl-3">
                  <FileCode2 className="size-3" />
                  Artifact: Dockerfile & docker-compose.yml
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-card/30">
        <div className="mx-auto flex max-w-[1400px] flex-col sm:flex-row items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8 text-xs text-muted-foreground text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-bold tracking-wider text-foreground">SKILLPROOF</span>
            <span className="hidden sm:inline">—</span>
            <span>Don&apos;t just claim skills. Prove them.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/analyze" className="hover:text-foreground">Analyze</Link>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/portfolio" className="hover:text-foreground">Portfolio</Link>
            <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
