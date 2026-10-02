# SkillProof — Judge Q&A & Technical Defense

This document provides concise, fact-grounded responses to the most critical technical and philosophical questions judges and engineering leads may ask about **SkillProof**.

---

### 1. Why not just use GitHub?
GitHub shows raw code, pull requests, and commit histories, but it lacks **claim context**, **skill normalization**, and **job-matching intelligence**. A hiring manager or interviewer cannot spend 45 minutes manually parsing dozens of repositories, commit diffs, config files, test suites, and package manifests to determine if a candidate actually knows Docker, TypeScript, or PostgreSQL.

SkillProof bridges this gap by:
1. Extracting candidate claims from their resume.
2. Automatically auditing public GitHub repositories for observable, signal-based technical artifacts (dependencies, imports, tests, workflows, container specs).
3. Linking claims directly to verifiable GitHub lines of code with reproducible proof trails.

---

### 2. Why use AI?
In SkillProof, **AI is used strictly as a pedagogical and contextual aid**, not as an evaluator:
- AI parses messy, unstructured job descriptions into structured requirements and skill lists.
- AI generates tailored micro-tasks targeting specific skill gaps so candidates know exactly what to build.
- AI synthesizes plain-English architectural summaries of the candidate's existing proof.

**AI NEVER assigns scores, NEVER determines verification status, and NEVER marks a skill as PROVEN.** All verification is 100% deterministic code.

---

### 3. Can AI hallucinate evidence?
**No.** Evidence extraction and skill verification do not use generative AI. All evidence items are extracted deterministically by querying GitHub's REST API for concrete file paths, package manifests, and repository metadata. 

If an evidence link points to a Dockerfile or a Jest test suite, that exact file exists in the candidate's GitHub repository. The verification engine only counts evidence that has been cryptographically or structurally verified via GitHub.

---

### 4. Why isn't README evidence enough?
A README is freeform markdown text. Anyone can clone a template, paste buzzwords, or copy a tutorial summary into a README without understanding or building the underlying system.

Under SkillProof's Phase 4 rules:
- Mentioning a skill in a README awards a minimal signal (score of 5), categorized at most as `CLAIMED_ONLY`.
- README mentions **cannot** push a skill to `PARTIAL` or `PROVEN` on their own.
- To achieve `PARTIAL` or `PROVEN`, the repository must contain substantive technical artifacts: verified package manifests, imports, implementation files, configuration files, automated tests, or CI/CD pipelines.

---

### 5. Can task completion automatically verify a skill?
**No, absolutely not.** Merely clicking "Complete Task" or submitting a repository URL does not verify a skill.

When a repository is submitted for a micro-task:
1. SkillProof's Phase 3 engine runs against the submitted repository.
2. Only new, observable technical artifacts (e.g., a newly pushed Dockerfile or unit test) are extracted.
3. The deterministic Phase 4 verifier evaluates the combined evidence base.
4. The skill status updates **only if the new evidence satisfies the strict Phase 4 score thresholds**. If the submitted repo does not contain qualifying code, the score delta is 0 and the skill remains unverified.

---

### 6. Does SkillProof execute submitted code?
**No.** SkillProof never runs untrusted candidate code in sandboxes or runtime environments:
- No `npm install` or `pip install`
- No `docker build` or container runs
- No shell script or binary execution

All analysis is static inspection performed through GitHub's authenticated or public REST API (inspecting repository trees, manifest content, file extensions, and path matches). This guarantees complete host security and eliminates arbitrary remote code execution risks.

---

### 7. What does "Not Verified" mean?
`NOT_VERIFIED` (or `CLAIMED_ONLY`) means **insufficient observable evidence was detected in the candidate's public GitHub activity**.

It **does not** imply the candidate lacks competence. The candidate may have acquired the skill through private enterprise repositories, closed-source client engagements, or offline education. SkillProof explicitly clarifies this distinction on the UI: *"Not Verified means insufficient public evidence, not that the candidate lacks the skill."*

---

### 8. Does SkillProof predict hiring?
**No.** SkillProof strictly avoids speculative metrics such as:
- Hiring probability or "Hire/No Hire" recommendations
- Candidate ranking or percentiles against other applicants
- Employability index scores
- Salary predictions

SkillProof is an objective **evidence verification tool**, not an algorithmic hiring decision-maker. It empowers human hiring teams with factual, auditable proof rather than automated gatekeeping.

---

### 9. How is evidence scored?
Verification follows a strict, deterministic signal rubric (Phase 4):
- **Signals evaluated**: Primary language, manifest dependencies, configuration files, test suites, CI/CD workflows, active commits, and repo stars.
- **Weights**: Core implementation files and dependencies grant high signal; automated tests and CI/CD grant depth signals; README mentions grant negligible signal.
- **Thresholds**:
  - `PROVEN`: Score $\ge 60$ with multi-signal evidence (e.g., manifest dependency + test suite/config).
  - `PARTIAL`: Score $\ge 25$ (e.g., dependency detected, but missing tests or CI/CD).
  - `CLAIMED_ONLY`: Score $< 25$ with resume claims or weak README mentions.
  - `NOT_VERIFIED`: No evidence found (score 0).

---

### 10. What happens if GitHub has little evidence?
When a candidate has minimal public GitHub repositories or their projects don't cover their resume claims:
1. The dashboard highlights these skills as `CLAIMED_ONLY` or `NOT_VERIFIED`.
2. When matched against a target job description, these skills appear as **Evidence Gaps**.
3. SkillProof activates the **AI Micro-Task Generator**, giving the candidate a scoped 30–60 minute project specification to build, push to GitHub, and immediately re-verify.

---

### 11. What happens if GitHub API rate limits occur?
- **Unauthenticated requests** to GitHub are limited to 60 calls/hour per IP.
- **Authenticated requests** (via `GITHUB_TOKEN` in `.env.local`) provide 5,000 calls/hour.
- If rate limits are exceeded, the API gracefully traps HTTP 403/429 responses, returns a clean error payload (`{ error: "RATE_LIMITED", message: "GitHub API rate limit exceeded..." }`), and alerts the user to configure a token or retry without crashing or exposing internal stack traces.

---

### 12. How does re-verification work?
The re-verification pipeline (Phase 10) operates as follows:
```
1. User submits public GitHub Repo URL for an assigned task
2. URL validation checks hostname & format (prevents SSRF/arbitrary fetching)
3. GitHub API fetches repo tree & package manifests
4. Phase 3 engine extracts candidate evidence items
5. Evidence Diff engine calculates:
     - Added evidence items
     - Unchanged evidence items
     - Removed evidence items
6. Phase 4 verifier evaluates updated evidence collection
7. Score Delta = NewScore - PreviousScore
8. UI displays transparent Before/After comparison
```
Verification only changes if qualifying technical evidence was genuinely added.
