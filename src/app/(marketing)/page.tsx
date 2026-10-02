import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileCode2,
  FileText,
  FolderGit2,
  GitBranch,
  Network,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { EvidencePreview } from "@/components/landing/evidence-preview";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

function GitHubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const featureCards = [
  {
    step: "01",
    title: "Resume Claim",
    description: "Extract declared technical skills and asserted competencies directly from your resume.",
    icon: FileText,
  },
  {
    step: "02",
    title: "GitHub Evidence",
    description: "Mine authentic commits, files, dependencies & CI configurations across public codebases.",
    icon: FolderGit2,
  },
  {
    step: "03",
    title: "Verification",
    description: "Deterministic scoring against strict technical criteria with no hallucinated ratings.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Skill Proof",
    description: "Auditable portfolio and shareable verification report ready for recruiters and teams.",
    icon: CheckCircle2,
  },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "Upload Resume",
    description: "Share your resume in PDF or DOCX format to parse declared skill claims.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Connect GitHub",
    description: "Link your GitHub repositories to discover genuine technical artifacts.",
    icon: GitHubIcon,
  },
  {
    number: "03",
    title: "Analyze & Verify",
    description: "Extract observable files, commits, and workflows against deterministic rules.",
    icon: Shield,
  },
  {
    number: "04",
    title: "Get Skill Report",
    description: "View your verified skills breakdown and share an auditable proof portfolio.",
    icon: CheckCircle2,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241914] antialiased">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#E7DCD1]/80 py-12 md:py-20 lg:py-24">
          {/* Subtle warm decorative glow */}
          <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#F4E2D3]/60 blur-3xl" />
          <div className="absolute -top-12 left-1/3 -z-10 h-72 w-72 rounded-full bg-[#E8C5B0]/30 blur-2xl" />

          <div className="mx-auto grid max-w-[1400px] gap-10 md:gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 min-w-0">
            {/* Left Column */}
            <div className="space-y-6 sm:space-y-8 min-w-0">
              {/* Proof Over Claims Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#A95F3D]/25 bg-[#F4E2D3]/70 px-4 py-1.5 text-xs font-bold tracking-wider text-[#A95F3D] uppercase shadow-xs">
                <Sparkles className="size-3.5 text-[#A95F3D]" />
                PROOF OVER CLAIMS
              </div>

              {/* Hero Heading */}
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-[0.25em] text-[#A95F3D] uppercase">
                  SKILLPROOF VERIFICATION ENGINE
                </p>
                <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-[#241914] sm:text-5xl lg:text-6xl text-balance leading-[1.1]">
                  Don&apos;t just claim skills.{" "}
                  <span className="text-[#A95F3D]">
                    Prove them.
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="max-w-xl text-base leading-relaxed text-[#756B64] sm:text-lg">
                SkillProof turns resume claims into traceable technical evidence from real GitHub work.
                Eliminate resume exaggeration with deterministic verification.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-[#A95F3D] hover:bg-[#8E4F32] text-white font-semibold text-sm h-12 min-h-[48px] px-7 rounded-xl shadow-md transition-all duration-200"
                >
                  <Link href="/analyze" className="inline-flex items-center gap-2">
                    Analyze My Skills
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-[#E7DCD1] bg-white hover:bg-[#F7EFE7] text-[#241914] font-semibold text-sm h-12 min-h-[48px] px-6 rounded-xl shadow-xs transition-all duration-200"
                >
                  <Link href="/dashboard">Explore Demo</Link>
                </Button>
              </div>

              {/* Three Trust Indicators */}
              <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3 sm:gap-4 border-t border-[#E7DCD1]/70">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F4E2D3] text-[#A95F3D]">
                    <Shield className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#241914] leading-snug">
                    Evidence-based verification
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F4E2D3] text-[#A95F3D]">
                    <BarChart3 className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#241914] leading-snug">
                    Deterministic scoring
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F4E2D3] text-[#A95F3D]">
                    <GitHubIcon className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#241914] leading-snug">
                    Real GitHub analysis
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column Visual (Layered Cards) */}
            <div className="min-w-0 w-full flex justify-center lg:justify-end">
              <EvidencePreview />
            </div>
          </div>
        </section>

        {/* Four Feature Cards */}
        <section className="border-b border-[#E7DCD1]/80 bg-[#FAF7F2] py-14 sm:py-18">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-12">
              <p className="text-[11px] font-bold tracking-[0.25em] text-[#A95F3D] uppercase">
                THE VERIFICATION ENGINE
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-[#241914] sm:text-3xl">
                Proof-driven technical validation
              </h2>
              <p className="text-xs sm:text-sm text-[#756B64]">
                A closed-loop engine linking what candidates declare to what they have genuinely built.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.step}
                    className="group relative rounded-2xl border border-[#E7DCD1] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#A95F3D]/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-[#F4E2D3] text-[#A95F3D] transition-colors group-hover:bg-[#A95F3D] group-hover:text-white">
                        <Icon className="size-5" />
                      </span>
                      <span className="font-mono text-xs font-bold text-[#A95F3D]">
                        {card.step}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-[#241914]">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#756B64]">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How SkillProof Works (Large Dark Espresso Section) */}
        <section className="py-14 sm:py-20 bg-[#FAF7F2]">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#241914] p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
              {/* Subtle decorative glow inside espresso card */}
              <div className="absolute top-0 right-0 -z-0 h-96 w-96 rounded-full bg-[#A95F3D]/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -z-0 h-72 w-72 rounded-full bg-[#6D351F]/30 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-10 sm:space-y-14">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3D2C24] pb-6 sm:pb-8">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold tracking-[0.25em] text-[#E8C5B0] uppercase">
                      STEP-BY-STEP PROOF
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-white">
                      How SkillProof works
                    </h2>
                    <p className="text-xs sm:text-sm text-[#E7DCD1]/80 max-w-xl">
                      From claims to verified skills in a few simple steps with complete evidence traceability.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-[#A95F3D] hover:bg-[#8E4F32] text-white text-xs font-semibold h-10 px-5 rounded-xl self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    <Link href="/analyze" className="inline-flex items-center gap-1.5">
                      View Full Process
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>

                {/* 4 Connected Steps */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {howItWorksSteps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.number}
                        className="relative rounded-2xl border border-[#3D2C24] bg-[#2E201A]/70 p-6 backdrop-blur-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-[#A95F3D]/20 text-[#E8C5B0] border border-[#A95F3D]/30">
                              <Icon className="size-5" />
                            </span>
                            <span className="font-mono text-sm font-bold text-[#E8C5B0]">
                              {step.number}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white mb-2">
                            {step.title}
                          </h3>
                          <p className="text-xs leading-relaxed text-[#E7DCD1]/75">
                            {step.description}
                          </p>
                        </div>

                        {idx < howItWorksSteps.length - 1 && (
                          <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#A95F3D]/70 font-bold">
                            →
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Disconnect: Claims vs Observable Evidence */}
        <section className="border-y border-[#E7DCD1]/80 bg-[#F7EFE7]/50 py-14 sm:py-20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2 mb-10">
              <p className="text-[11px] font-bold tracking-[0.25em] text-[#A95F3D] uppercase">
                THE DISCONNECT
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[#241914]">
                Resumes show claims. GitHub shows evidence.
              </h2>
              <p className="text-xs sm:text-sm text-[#756B64]">
                Anyone can list a buzzword on a CV. Traceability proves true familiarity.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Traditional Resume Box */}
              <div className="rounded-2xl border border-[#E7DCD1] bg-white p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-3.5">
                  <span className="text-xs font-bold text-[#756B64] uppercase tracking-wider">
                    Traditional Resume
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#C94A4A] bg-[#C94A4A]/10 px-2.5 py-1 rounded-md">
                    Untrusted Claims
                  </span>
                </div>
                <div className="rounded-xl border border-[#C94A4A]/25 bg-[#FAF7F2] p-4 font-mono text-xs text-[#241914] space-y-2">
                  <p className="font-semibold text-xs text-[#241914]">
                    Skills: Python, React, Docker, AWS, Kubernetes
                  </p>
                  <p className="text-[11px] text-[#756B64] italic">
                    (No commit history, no code references, no proof of production usage)
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-[#756B64]">
                  Recruiters and hiring managers spend days manually interviewing candidates to verify whether
                  skills listed on resumes represent actual experience or aspirational claims.
                </p>
              </div>

              {/* SkillProof Verification Box */}
              <div className="rounded-2xl border border-[#2E8B57]/30 bg-white p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-3.5">
                  <span className="text-xs font-bold text-[#A95F3D] uppercase tracking-wider">
                    SkillProof Verification
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#2E8B57] bg-[#E3F3E8] px-2.5 py-1 rounded-md">
                    Traceable Evidence
                  </span>
                </div>
                <div className="rounded-xl border border-[#2E8B57]/30 bg-[#FAF7F2] p-4 font-mono text-xs text-[#241914] space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241914]">Docker</span>
                    <span className="text-[#2E8B57] font-extrabold">PROVEN (92/100)</span>
                  </div>
                  <div className="text-[11px] text-[#756B64] pl-3 border-l-2 border-[#2E8B57] mt-2 space-y-1 min-w-0">
                    <p className="break-all">↳ repo: user/cloud-api • Dockerfile (detected)</p>
                    <p className="break-all">↳ repo: user/cloud-api • docker-compose.yml (detected)</p>
                    <p className="break-all">↳ repo: user/cloud-api • .github/workflows/deploy.yml (verified)</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-[#756B64]">
                  Every skill score is computed from observable artifacts in public codebases. Inspect
                  the graph, verify the files, and trust the proof.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trace Path Example / Interactive Graph CTA */}
        <section className="py-14 sm:py-20 bg-[#FAF7F2]">
          <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="space-y-4">
              <p className="text-[11px] font-bold tracking-[0.25em] text-[#A95F3D] uppercase">
                INTERACTIVE EVIDENCE GRAPH
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-[#241914]">
                See the evidence behind every claim.
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-[#756B64]">
                Explore an interactive node map linking candidates to extracted claims, skills, repositories,
                files, and verifiable commits.
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  className="bg-[#A95F3D] hover:bg-[#8E4F32] text-white text-xs font-semibold h-11 px-5 rounded-xl shadow-sm"
                >
                  <Link href="/evidence" className="inline-flex items-center gap-2">
                    <Network className="size-4" />
                    Open Evidence Graph
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7DCD1] bg-white p-5 sm:p-7 shadow-sm space-y-4 min-w-0">
              <div className="flex items-center justify-between border-b border-[#E7DCD1] pb-3 text-xs">
                <span className="font-bold text-[#241914]">Trace Path Example</span>
                <span className="font-mono text-[#A95F3D] text-[11px] font-semibold">Node Hierarchy</span>
              </div>
              <div className="space-y-2.5 font-mono text-xs min-w-0">
                <div className="flex items-center gap-2 text-[#241914] min-w-0">
                  <span className="size-2 rounded-full bg-[#A95F3D] shrink-0" />
                  <span className="truncate font-semibold">Candidate: Alex Rivera</span>
                </div>
                <div className="ml-2 sm:ml-4 flex items-center gap-2 text-[#756B64] border-l-2 border-[#E7DCD1] pl-3 min-w-0">
                  <FileText className="size-3.5 text-[#756B64] shrink-0" />
                  <span className="truncate">Claim: &quot;Docker & Containerization&quot;</span>
                </div>
                <div className="ml-4 sm:ml-8 flex items-center gap-2 text-[#2E8B57] border-l-2 border-[#E7DCD1] pl-3 font-semibold min-w-0">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span className="truncate">Verified Skill: Docker (PROVEN — 92/100)</span>
                </div>
                <div className="ml-6 sm:ml-12 flex items-center gap-2 text-[#241914] border-l-2 border-[#E7DCD1] pl-3 min-w-0">
                  <GitBranch className="size-3.5 text-[#756B64] shrink-0" />
                  <span className="truncate">Repo: alexrivera/cloud-service</span>
                </div>
                <div className="ml-8 sm:ml-16 flex items-center gap-2 text-[#A95F3D] border-l-2 border-[#E7DCD1] pl-3 min-w-0 font-medium">
                  <FileCode2 className="size-3.5 shrink-0" />
                  <span className="truncate">Artifact: Dockerfile & docker-compose.yml</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7DCD1] bg-[#F7EFE7]/60">
        <div className="mx-auto flex max-w-[1400px] flex-col sm:flex-row items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8 text-xs text-[#756B64] text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-bold tracking-wider text-[#241914]">SKILLPROOF</span>
            <span className="hidden sm:inline text-[#E7DCD1]">|</span>
            <span>Don&apos;t just claim skills. Prove them.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 font-medium text-[#241914]">
            <Link href="/analyze" className="hover:text-[#A95F3D] transition-colors">Analyze</Link>
            <Link href="/dashboard" className="hover:text-[#A95F3D] transition-colors">Dashboard</Link>
            <Link href="/evidence" className="hover:text-[#A95F3D] transition-colors">Evidence</Link>
            <Link href="/jobs" className="hover:text-[#A95F3D] transition-colors">Jobs</Link>
            <Link href="/tasks" className="hover:text-[#A95F3D] transition-colors">Tasks</Link>
            <Link href="/portfolio" className="hover:text-[#A95F3D] transition-colors">Portfolio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
