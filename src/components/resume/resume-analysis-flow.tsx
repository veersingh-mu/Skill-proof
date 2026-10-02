"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  GitBranch,
  LayoutDashboard,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SKILL_NAMES } from "@/lib/resume/taxonomy";
import { normalizeSkill } from "@/lib/resume/normalize";
import type { ResumeClaim } from "@/types";
import type { GitHubAnalysisResult } from "@/types/github";
import { GitHubEvidenceView } from "@/components/github/github-evidence-view";
import { EvidenceVerificationView } from "@/components/evidence/evidence-verification-view";
import { evaluateEvidence, saveVerificationSession } from "@/lib/evidence";

type AnalysisState = "IDLE" | "PARSING" | "EXTRACTING" | "REVIEW" | "READY" | "ERROR";
type AnalysisResponse = {
  candidate: { name?: string; email?: string };
  githubUsername?: string;
  skills: ResumeClaim[];
  metadata: { filename: string; pageCount: number };
};

const stateCopy: Record<Extract<AnalysisState, "PARSING" | "EXTRACTING">, string> = {
  PARSING: "Reading your resume…",
  EXTRACTING: "Extracting technical skill claims…",
};

const GITHUB_PROGRESS_STAGES = [
  "Connecting to GitHub...",
  "Fetching profile...",
  "Finding repositories...",
  "Analyzing repositories...",
  "Inspecting dependencies...",
  "Inspecting tests...",
  "Inspecting commits...",
  "Building evidence...",
  "Completed.",
];

const GITHUB_USERNAME_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

function isValidGitHubUsername(username: string): boolean {
  return GITHUB_USERNAME_REGEX.test(username.trim());
}

export function ResumeAnalysisFlow() {
  const [state, setState] = useState<AnalysisState>("IDLE");
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<AnalysisResponse>();
  const [claims, setClaims] = useState<ResumeClaim[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [skillInput, setSkillInput] = useState("");

  // GitHub Analysis State
  const [githubStatus, setGithubStatus] = useState<"IDLE" | "ANALYZING" | "COMPLETED" | "ERROR">("IDLE");
  const [githubStage, setGithubStage] = useState<string>("Connecting to GitHub...");
  const [githubResult, setGithubResult] = useState<GitHubAnalysisResult | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      Object.entries(
        claims.reduce<Record<string, ResumeClaim[]>>((accumulator, claim) => {
          (accumulator[claim.category] ??= []).push(claim);
          return accumulator;
        }, {})
      ),
    [claims]
  );

  const trimmedUsername = githubUsername.trim();
  const isUsernameValid = trimmedUsername.length > 0 && isValidGitHubUsername(trimmedUsername);
  const isUsernameInvalid = trimmedUsername.length > 0 && !isValidGitHubUsername(trimmedUsername);

  const evidenceEvaluation = useMemo(() => {
    if (!githubResult || claims.length === 0) return null;
    return evaluateEvidence(claims, githubResult.evidence, githubResult.repositories);
  }, [githubResult, claims]);

  // Persist the real verification session for the dashboard
  useEffect(() => {
    if (evidenceEvaluation && githubResult && claims.length > 0) {
      saveVerificationSession({
        candidate: {
          name: candidateName || result?.candidate.name || "Candidate",
          email: result?.candidate.email,
        },
        githubUsername: trimmedUsername,
        analyzedAt: new Date().toISOString(),
        metadata: result?.metadata,
        claims,
        githubResult,
        evaluation: evidenceEvaluation,
      });
    }
  }, [evidenceEvaluation, githubResult, claims, candidateName, result, trimmedUsername]);

  function chooseFile(nextFile?: File) {
    setError(undefined);
    setResult(undefined);
    setClaims([]);
    setCandidateName("");
    setGithubUsername("");
    setGithubStatus("IDLE");
    setGithubResult(null);
    setGithubError(null);
    setState("IDLE");

    if (!nextFile) {
      setFile(undefined);
      return;
    }
    if (nextFile.type && nextFile.type !== "application/pdf") {
      setFile(undefined);
      setError("Please upload a PDF resume.");
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setFile(undefined);
      setError("Please upload a PDF smaller than 5 MB.");
      return;
    }
    setFile(nextFile);
  }

  async function analyze() {
    if (!file) {
      setError("Choose a PDF resume before analyzing.");
      return;
    }
    setError(undefined);
    setState("PARSING");
    try {
      const body = new FormData();
      body.append("resume", file);
      const response = await fetch("/api/resumes/analyze", { method: "POST", body });
      const data = (await response.json()) as AnalysisResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to process this resume.");
      setState("EXTRACTING");
      setResult(data);
      setClaims(data.skills);
      setCandidateName(data.candidate.name ?? "");
      setGithubUsername(data.githubUsername ?? "");
      setState("REVIEW");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to process this resume.");
      setState("ERROR");
    }
  }

  function addSkill() {
    const skill = normalizeSkill(skillInput);
    if (!skill) {
      setError("Choose a skill from the supported taxonomy.");
      return;
    }
    if (claims.some((claim) => claim.canonicalSkill === skill.canonicalName)) {
      setError(`${skill.canonicalName} is already listed.`);
      return;
    }
    setClaims((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        canonicalSkill: skill.canonicalName,
        displayName: skill.canonicalName,
        category: skill.category,
        sourceSection: "OTHER",
        sourceText: "Added during candidate review",
        confidence: 1,
        status: "UNVERIFIED",
      },
    ]);
    setSkillInput("");
    setError(undefined);
  }

  async function verifyWithGithub() {
    const targetUsername = githubUsername.trim();
    if (!targetUsername) {
      setGithubError("Please enter a GitHub username to analyze.");
      setGithubStatus("ERROR");
      return;
    }

    if (!isValidGitHubUsername(targetUsername)) {
      setGithubError(
        "Invalid GitHub username format. Usernames can only contain alphanumeric characters and single hyphens, and cannot start or end with a hyphen (maximum 39 characters)."
      );
      setGithubStatus("ERROR");
      return;
    }

    setGithubStatus("ANALYZING");
    setGithubError(null);
    setGithubResult(null);

    let stageIndex = 0;
    setGithubStage(GITHUB_PROGRESS_STAGES[0]);
    const interval = setInterval(() => {
      stageIndex += 1;
      if (stageIndex < GITHUB_PROGRESS_STAGES.length - 1) {
        setGithubStage(GITHUB_PROGRESS_STAGES[stageIndex]);
      }
    }, 750);

    try {
      const response = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        let msg = data.error || "Unable to complete GitHub analysis.";
        if (response.status === 404 || data.code === "NOT_FOUND") {
          msg = `GitHub user "${targetUsername}" was not found. Please verify the username and try again.`;
        } else if (response.status === 429 || data.code === "RATE_LIMIT") {
          msg = "GitHub API rate limit reached. Public GitHub requests are rate-limited. Please wait a moment or configure a GITHUB_TOKEN on the server.";
        }
        throw new Error(msg);
      }

      setGithubStage(GITHUB_PROGRESS_STAGES[GITHUB_PROGRESS_STAGES.length - 1]);
      setGithubResult(data as GitHubAnalysisResult);
      setGithubStatus("COMPLETED");

      setTimeout(() => {
        document.getElementById("github-evidence-results")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : "GitHub analysis failed.");
      setGithubStatus("ERROR");
    } finally {
      clearInterval(interval);
    }
  }

  const processing = state === "PARSING" || state === "EXTRACTING";

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6">
      <section className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium">Resume upload</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your PDF is processed by this application and is not stored permanently.
            </p>
          </div>
          {file && <span className="font-mono text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB</span>}
        </div>
        <div className="mt-6">
          <FileUpload
            file={file}
            error={state === "IDLE" ? error : undefined}
            disabled={processing}
            onChange={chooseFile}
            onRemove={() => chooseFile(undefined)}
          />
        </div>
        <Button size="lg" className="mt-5 w-full" disabled={!file || processing} onClick={analyze}>
          {processing ? (
            <>
              <LoaderCircle className="animate-spin" />
              {stateCopy[state]}
            </>
          ) : (
            <>
              <FileSearch /> Analyze resume
            </>
          )}
        </Button>
        {state === "ERROR" && (
          <div role="alert" className="mt-5 flex gap-3 rounded-lg border border-red-400/20 bg-red-400/[0.08] p-4 text-sm text-red-100">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-300" />
            {error}
          </div>
        )}
      </section>

      {result && (
        <>
          {/* Step 1: Resume Analysis & Claims Review */}
          <section className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">Resume analysis</p>
                <h2 className="mt-2 text-xl font-semibold">Review your detected claims</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.metadata.filename} · {result.metadata.pageCount} page{result.metadata.pageCount === 1 ? "" : "s"}
                </p>
              </div>
              <Badge variant="outline" className="border-amber-400/25 bg-amber-400/10 text-amber-200">
                Unverified resume claims
              </Badge>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="candidate-name" className="mb-2 block text-sm font-medium">
                  Candidate
                </label>
                <Input
                  id="candidate-name"
                  value={candidateName}
                  onChange={(event) => setCandidateName(event.target.value)}
                  placeholder="Candidate name"
                />
              </div>
              <div>
                <label htmlFor="github-username" className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <GitBranch className="size-4" />
                    GitHub username
                  </span>
                  {result.githubUsername && (
                    <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-300">
                      Detected from resume
                    </span>
                  )}
                </label>
                <Input
                  id="github-username"
                  value={githubUsername}
                  onChange={(event) => {
                    setGithubUsername(event.target.value);
                    if (githubStatus === "ERROR") {
                      setGithubStatus("IDLE");
                      setGithubError(null);
                    }
                  }}
                  placeholder="e.g. pratyushwakde24-source"
                  className={
                    isUsernameInvalid
                      ? "border-red-500 focus-visible:ring-red-500"
                      : isUsernameValid
                      ? "border-emerald-500/50 focus-visible:ring-emerald-500"
                      : ""
                  }
                />
                {isUsernameInvalid && (
                  <p className="mt-1.5 text-xs text-red-400">
                    Invalid GitHub username format (letters, numbers, single hyphens only, max 39 characters).
                  </p>
                )}
                {isUsernameValid && (
                  <p className="mt-1.5 text-xs text-emerald-400/80">
                    Valid GitHub username format.
                  </p>
                )}
                {!trimmedUsername && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Required for Phase 3 GitHub activity mining.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-7 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100">
              <p className="font-semibold text-amber-200 mb-0.5">Step 1: Unverified Resume Claims</p>
              These skills are unverified claims extracted from your resume. Review and edit the skills list below, ensure your GitHub username is correct, and confirm your claims to proceed with Phase 3 GitHub evidence mining.
            </div>

            <div className="mt-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-medium">Detected technical skills</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Remove incorrect skills or add a missing item before confirming.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    list="taxonomy-skills"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    placeholder="Add a skill"
                    className="w-44"
                  />
                  <datalist id="taxonomy-skills">
                    {SKILL_NAMES.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  <Button type="button" variant="outline" onClick={addSkill}>
                    <Plus className="size-4" /> Add Skill
                  </Button>
                </div>
              </div>

              <div className="mt-5 space-y-6">
                {groups.map(([category, categoryClaims]) => (
                  <div key={category}>
                    <p className="mb-2.5 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">{category}</p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {categoryClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className="flex flex-col justify-between rounded-lg border border-border bg-background/80 p-3 text-sm transition-colors hover:border-border/80"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{claim.displayName}</span>
                              <span className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-amber-300">
                                UNVERIFIED
                              </span>
                            </div>
                            <button
                              type="button"
                              aria-label={`Remove ${claim.displayName}`}
                              onClick={() => setClaims((current) => current.filter((item) => item.id !== claim.id))}
                              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Source: {claim.sourceSection}
                            </span>
                          </div>
                          {claim.sourceText && (
                            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground/80 italic">
                              &ldquo;{claim.sourceText}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {claims.length === 0 && (
                <p className="mt-5 text-sm text-muted-foreground">No claims remain. Add a supported technical skill to continue.</p>
              )}
            </div>

            {/* Claims Confirmation Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              <div className="flex flex-wrap items-center gap-3">
                {state === "READY" ? (
                  <>
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2 text-sm font-medium text-emerald-300">
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      Resume claims confirmed ({claims.length} claim{claims.length === 1 ? "" : "s"})
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setState("REVIEW")}>
                      Edit claims
                    </Button>
                  </>
                ) : (
                  <Button
                    disabled={claims.length === 0}
                    onClick={() => {
                      setState("READY");
                      setTimeout(() => {
                        document.getElementById("github-mining-section")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="bg-primary text-primary-foreground font-medium"
                  >
                    <CheckCircle2 className="size-4 mr-1.5" /> Confirm {claims.length} claim{claims.length === 1 ? "" : "s"}
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {state === "READY"
                  ? "Claims confirmed. Proceed to GitHub analysis below."
                  : "Confirm claims to unlock Phase 3 GitHub activity mining."}
              </p>
            </div>
          </section>

          {/* Step 2: Phase 3 GitHub Activity Mining Section */}
          <section id="github-mining-section" className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
                    Phase 3 · GitHub Activity Mining
                  </p>
                  <Badge variant="outline" className="border-cyan-400/25 bg-cyan-400/10 text-cyan-300 text-[10px]">
                    Factual Evidence
                  </Badge>
                </div>
                <h3 className="mt-1 text-xl font-semibold">Mine Factual GitHub Evidence</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Inspect public repositories, manifests (package.json, requirements.txt, go.mod, Cargo.toml), languages, and commit history.
                </p>
              </div>

              {githubStatus === "COMPLETED" && (
                <Badge variant="outline" className="border-emerald-400/25 bg-emerald-400/10 text-emerald-300 text-xs">
                  <CheckCircle2 className="size-3.5 mr-1 text-emerald-400" /> Evidence detected
                </Badge>
              )}
            </div>

            {/* Pending claims confirmation notice */}
            {state !== "READY" && (
              <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground flex items-center gap-3">
                <GitBranch className="size-5 text-muted-foreground shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Step 1 required:</span>
                  <p className="text-xs mt-0.5">
                    Confirm your {claims.length} resume claim{claims.length === 1 ? "" : "s"} above to unlock GitHub evidence mining.
                  </p>
                </div>
              </div>
            )}

            {/* Missing username notice */}
            {state === "READY" && !trimmedUsername && (
              <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/[0.08] p-4 text-sm text-amber-200 flex items-center gap-3">
                <ShieldAlert className="size-5 text-amber-300 shrink-0" />
                <div>
                  <span className="font-medium text-amber-100">GitHub username required:</span>
                  <p className="text-xs mt-0.5 text-amber-200/90">
                    Enter your GitHub username in the field above to mine public repositories for evidence.
                  </p>
                </div>
              </div>
            )}

            {/* Action Trigger Card */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/60 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Target GitHub Profile:</span>
                  {trimmedUsername ? (
                    <span className="font-mono text-sm font-semibold text-emerald-300">@{trimmedUsername}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None entered</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Deterministic extraction of repositories, language stats, manifests, CI/CD, and recent commits.
                </p>
              </div>

              <Button
                size="lg"
                disabled={state !== "READY" || !isUsernameValid || githubStatus === "ANALYZING"}
                onClick={verifyWithGithub}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-all"
              >
                {githubStatus === "ANALYZING" ? (
                  <>
                    <LoaderCircle className="animate-spin size-4" />
                    Analyzing GitHub...
                  </>
                ) : githubStatus === "COMPLETED" ? (
                  <>
                    <RefreshCw className="size-4" /> Re-analyze GitHub (@{trimmedUsername})
                  </>
                ) : (
                  <>
                    <GitBranch className="size-4" /> Analyze GitHub {trimmedUsername ? `(@${trimmedUsername})` : ""}
                  </>
                )}
              </Button>
            </div>

            {/* Loading Progress State */}
            {githubStatus === "ANALYZING" && (
              <div className="mt-6 rounded-lg border border-border bg-card/80 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <LoaderCircle className="animate-spin text-emerald-400 size-5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{githubStage}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Querying GitHub API for @{trimmedUsername} — inspecting repositories, dependencies, and commit history.
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-full animate-pulse bg-emerald-500 rounded-full" />
                </div>
              </div>
            )}

            {/* Error State */}
            {githubStatus === "ERROR" && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-400/25 bg-red-400/[0.08] p-5 text-sm text-red-100 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0 text-red-300" />
                  <div>
                    <h4 className="font-semibold text-red-200">GitHub Analysis Failed</h4>
                    <p className="mt-1 text-xs text-red-200/90 leading-relaxed">{githubError}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={verifyWithGithub}
                    className="border-red-400/30 text-red-100 hover:bg-red-400/20"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* GitHub Factual Evidence Results */}
          {githubResult && (
            <div id="github-evidence-results" className="mt-8 space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-5 py-3 text-sm text-emerald-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Evidence detected:</strong> Successfully mined {githubResult.summary.evidenceItems} technical evidence items across {githubResult.summary.repositoriesAnalyzed} public repositories for @{githubResult.profile.username}.
                  </span>
                </div>
              </div>
              <GitHubEvidenceView result={githubResult} />
            </div>
          )}

          {/* Phase 4 — Deterministic Evidence Verification Section */}
          {evidenceEvaluation && (
            <div id="phase-4-evidence-verification" className="mt-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-4 text-emerald-400" />
                    <h3 className="text-base font-semibold text-foreground">
                      Deterministic Skill Verification Dashboard Ready
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {evidenceEvaluation.summary.provenCount} Proven, {evidenceEvaluation.summary.partialCount} Partial, {evidenceEvaluation.summary.claimedOnlyCount} Claimed-Only. View the comprehensive candidate dashboard.
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs h-9 px-4 shrink-0 shadow-sm"
                >
                  <Link href="/dashboard">
                    Open Full Dashboard <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>

              <EvidenceVerificationView evaluation={evidenceEvaluation} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
