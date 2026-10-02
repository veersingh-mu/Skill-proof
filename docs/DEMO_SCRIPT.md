# SkillProof — 3-Minute Hackathon Demo Script

> **Product Message:** *"Don't just claim skills. Prove them."*  
> **Target Duration:** 3–5 minutes  
> **Audience:** Hackathon Judges, Technical Reviewers, Mentors, Recruiters

---

## ⏱️ Step-by-Step Presentation Timeline

### 00:00 – 00:20 | The Problem
- **Speaker:**  
  *"Resumes tell us what candidates claim. They don't necessarily show what they can prove. Today, anyone can list Docker, Kubernetes, AWS, and React on a resume. Engineering leaders and recruiters spend countless hours trying to separate genuine hands-on experience from buzzword stuffing. SkillProof solves this by transforming unverified claims into observable, reproducible technical proof from real GitHub work."*
- **Screen:** Navigate to `http://localhost:3000/` (Landing Page).
- **Key Visual:** Highlight the hero tagline *"Don't just claim skills. Prove them."* and the sample verification card illustrating the proof lifecycle.

---

### 00:20 – 00:45 | Candidate Intake & Resume Parsing
- **Speaker:**  
  *"Let's start by ingesting a candidate's resume. SkillProof deterministically extracts technical skill claims from text-based resumes and normalizes them against our canonical skill taxonomy."*
- **Action:** Click **"Analyze My Skills"** (or open `/analyze`).
- **Screen:** Upload or inspect sample claims (`React`, `TypeScript`, `Docker`, `AWS`, `Python`).
- **Note:** Emphasize that all newly extracted claims are initially marked as `UNVERIFIED`. No AI is used to invent scores or verify skills.

---

### 00:45 – 01:15 | GitHub Evidence Mining
- **Speaker:**  
  *"Next, we connect the candidate's public GitHub profile. SkillProof's read-only analyzer inspects public repositories—not to execute arbitrary code, but to extract verifiable artifacts: Dockerfiles, package dependencies, CI/CD pipeline definitions, test suites, and commit frequency."*
- **Screen:** Navigate to `/dashboard` (or view GitHub activity breakdown).
- **Key Visual:** Point out the **Repositories Analyzed** stat and the breakdown of signals (dependencies, workflows, manifests).

---

### 01:15 – 01:45 | Deterministic Verification Engine
- **Speaker:**  
  *"The heart of SkillProof is our Phase 4 Deterministic Verification Engine. We apply strict, multi-signal evidence rules. Every skill is classified into one of three factual states:"*
  1. **`PROVEN` (Emerald):** Strong, multi-signal technical evidence satisfies the verification criteria.
  2. **`PARTIAL` (Amber):** Some qualifying evidence was found, but the verification threshold has not yet been reached.
  3. **`CLAIMED ONLY` (Neutral Slate):** The skill is declared on the resume, but no qualifying public evidence was detected.
- **Critical Distinction:**  
  *"Crucially: `Claimed Only` or `Not Verified` never means 'you don't know this skill.' It strictly means 'insufficient public evidence was observed.' SkillProof never insults candidates or predicts human ability."*

---

### 01:45 – 02:15 | Job Matching & Evidence Gap Detection
- **Speaker:**  
  *"Now let's compare the candidate against a target job description. We paste a real job posting into our Job Matcher."*
- **Action:** Open `/jobs`. Click **"Load Sample Job"** or paste a job description.
- **Screen:** Requirements are parsed into **Required Skills** vs. **Preferred Skills**.
- **Key Visual:** Point out the match states:
  - `Docker` → `Required` → `VERIFIED MATCH`
  - `AWS` → `Required` → `EVIDENCE GAP` (Priority: `HIGH`)
- **Important Note:** SkillProof generates zero hiring predictions, candidate rankings, or employability scores. It strictly reports factual requirement alignment.

---

### 02:15 – 02:45 | AI Micro-Task Generation
- **Speaker:**  
  *"What happens when a candidate has an evidence gap in a required skill like AWS? SkillProof generates a concrete, practical Micro-Task designed to build real GitHub artifacts."*
- **Action:** Click **"Generate Practical Task →"** next to AWS (or navigate to `/tasks?skill=AWS`).
- **Screen:** Display the generated task card.
- **Core Concept:**  
  *"Notice our strict architectural boundary: AI generates the task challenge. AI does NOT verify the skill. Verification can ONLY be awarded by real GitHub code artifacts."*

---

### 02:45 – 03:20 | Candidate Submission & Real Evidence Analysis
- **Speaker:**  
  *"The candidate completes the challenge and publishes their project to a public GitHub repository. They paste the repository URL into our submission form."*
- **Action:** Scroll to **"Show us the work."** card on `/tasks`.
- **Screen:** Observe the multi-step loading sequence:
  - *Analyzing repository...*
  - *Comparing new evidence...*
  - *Re-verifying skill...*

---

### 03:20 – 03:45 | Deterministic Re-verification (Before → After)
- **Speaker:**  
  *"SkillProof analyzes the newly submitted repository, computes the exact Evidence Difference, and re-evaluates the skill under the same Phase 4 rules. If and only if qualifying artifacts exist, the status upgrades."*
- **Screen:** Display the **Before vs. After** comparison card:
  - **BEFORE:** `PARTIAL (50)`
  - **NEW EVIDENCE:** `+ Docker Compose`, `+ CI/CD Workflow`
  - **AFTER:** `PROVEN (78)` (`+28 score delta`)
- **Key Takeaway:** The task completion itself awards zero points. Only the verified GitHub artifacts produce proof.

---

### 03:45 – 04:30 | The Evidence Portfolio & Shareable Report
- **Speaker:**  
  *"Finally, all verified proof converges into the SkillProof Evidence Portfolio."*
- **Action:** Open `/portfolio`.
- **Screen:** Showcase the **Skill Proof Matrix**, click a skill to open the **Technical Evidence Deep Dive**, and view the **Verification History** timeline.
- **Action:** Click **"Presentation Report"** (or open `/portfolio/report`).
- **Screen:** Display the clean, distraction-free document. Click **"Print / Save as PDF"** to demonstrate print CSS that hides all interactive buttons and formats the report for judges or recruiters.

---

### 04:30 – 05:00 | Closing
- **Speaker:**  
  *"SkillProof turns static, unverified resume claims into traceable, auditable, and reproducible technical proof. Don't just claim skills. Prove them. Thank you."*

---

## 🎯 Quick Demo Checklist

| Step | Target Route | Expected Action | Verification Check |
|---|---|---|---|
| 1 | `/` | Hero section | "Don't just claim skills. Prove them." visible |
| 2 | `/analyze` | Review claims | Skills extracted and normalized |
| 3 | `/dashboard` | Metrics overview | Proven, Partial, Gaps, Repositories cards |
| 4 | `/evidence` | Interactive graph | Node click opens artifact details |
| 5 | `/jobs` | Job requirements | Required vs Preferred gap breakdown |
| 6 | `/tasks` | Micro-task & submission | Task card details; submission form |
| 7 | `/portfolio` | Skill matrix & proof | Direct GitHub links; evidence inspection |
| 8 | `/portfolio/report` | Printable view | Clean print layout; no buttons visible in print |
