import { describe, expect, it } from "vitest";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import {
  analyzeJobDescriptionSchema,
  extractJobRequirements,
  matchJobRequirements,
  MAX_JD_LENGTH,
} from "@/lib/jobs";

describe("Phase 7 — Job Description Matching", () => {
  const SAMPLE_SESSION = createSampleVerificationSession();

  const FIXTURE_JD = `We are looking for a Full Stack Developer.

Required Skills:
- React
- Node.js
- TypeScript
- MongoDB

Preferred Skills:
- Docker
- AWS
- Python

The candidate should have experience building web applications,
REST APIs, frontend interfaces, databases and deploying applications.`;

  // 1. Required skill extraction
  it("TEST 1: extracts required skills from explicit required sections", () => {
    const text = `Required Skills:
- React
- TypeScript
- Node.js`;
    const result = extractJobRequirements(text);
    expect(result.requiredSkills).toEqual(expect.arrayContaining(["React", "TypeScript", "Node.js"]));
    expect(result.requirements.filter((r) => r.requirementType === "REQUIRED")).toHaveLength(3);
  });

  // 2. Preferred skill extraction
  it("TEST 2: extracts preferred skills from explicit preferred sections", () => {
    const text = `Nice to Have:
- Docker
- AWS
- Python`;
    const result = extractJobRequirements(text);
    expect(result.preferredSkills).toEqual(expect.arrayContaining(["Docker", "AWS", "Python"]));
    expect(result.requirements.filter((r) => r.requirementType === "PREFERRED")).toHaveLength(3);
  });

  // 3. Skill normalization
  it("TEST 3: normalizes aliases to canonical taxonomy skill names", () => {
    const text = `Required:
- React.js
- NodeJS
- TS
- Postgres
- Mongo DB
- K8s`;
    const result = extractJobRequirements(text);
    expect(result.extractedSkills).toEqual(
      expect.arrayContaining(["React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "Kubernetes"])
    );
    expect(result.extractedSkills).not.toContain("React.js");
    expect(result.extractedSkills).not.toContain("NodeJS");
    expect(result.extractedSkills).not.toContain("TS");
    expect(result.extractedSkills).not.toContain("Postgres");
    expect(result.extractedSkills).not.toContain("Mongo DB");
    expect(result.extractedSkills).not.toContain("K8s");
  });

  // 4. Duplicate skill normalization
  it("TEST 4: deduplicates skills and gives REQUIRED precedence over PREFERRED", () => {
    const text = `Required Skills:
- React
- TypeScript

Preferred Skills:
- React
- Docker`;
    const result = extractJobRequirements(text);
    const reactReq = result.requirements.find((r) => r.skill === "React");
    expect(reactReq).toBeDefined();
    expect(reactReq?.requirementType).toBe("REQUIRED");
    // Ensure React is only present once in extractedSkills
    expect(result.extractedSkills.filter((s) => s === "React")).toHaveLength(1);
    expect(result.requiredSkills).toContain("React");
    expect(result.preferredSkills).not.toContain("React");
  });

  // 5. PROVEN -> VERIFIED_MATCH
  it("TEST 5: maps PROVEN candidate skill to VERIFIED_MATCH with score and evidence", () => {
    const text = `Required Skills:
- React`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    expect(match.matches).toHaveLength(1);
    const reactMatch = match.matches[0];
    expect(reactMatch.skill).toBe("React");
    expect(reactMatch.candidateStatus).toBe("PROVEN");
    expect(reactMatch.matchStatus).toBe("VERIFIED_MATCH");
    expect(reactMatch.verificationScore).toBe(100);
    expect(reactMatch.supportingEvidence.length).toBeGreaterThan(0);
    expect(reactMatch.repositoryCount).toBeGreaterThan(0);
  });

  // 6. PARTIAL -> PARTIAL_MATCH
  it("TEST 6: maps PARTIAL candidate skill to PARTIAL_MATCH with partial evidence", () => {
    const text = `Preferred Skills:
- Docker`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    expect(match.matches).toHaveLength(1);
    const dockerMatch = match.matches[0];
    expect(dockerMatch.skill).toBe("Docker");
    expect(dockerMatch.candidateStatus).toBe("PARTIAL");
    expect(dockerMatch.matchStatus).toBe("PARTIAL_MATCH");
    expect(dockerMatch.verificationScore).toBe(50);
    expect(dockerMatch.supportingEvidence.length).toBeGreaterThan(0);
  });

  // 7. CLAIMED_ONLY -> NOT_VERIFIED
  it("TEST 7: maps CLAIMED_ONLY candidate skill to NOT_VERIFIED with empty evidence", () => {
    const text = `Required Skills:
- Python`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    expect(match.matches).toHaveLength(1);
    const pythonMatch = match.matches[0];
    expect(pythonMatch.skill).toBe("Python");
    expect(pythonMatch.candidateStatus).toBe("CLAIMED_ONLY");
    expect(pythonMatch.matchStatus).toBe("NOT_VERIFIED");
    expect(pythonMatch.supportingEvidence).toHaveLength(0);
    expect(pythonMatch.repositoryCount).toBe(0);
    expect(pythonMatch.explanation).toContain("No sufficient GitHub evidence currently verifies Python.");
  });

  // 8. Missing candidate skill -> NOT_VERIFIED
  it("TEST 8: maps unmentioned skill to NOT_VERIFIED without crashing or inventing evidence", () => {
    const text = `Required Skills:
- MongoDB`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    expect(match.matches).toHaveLength(1);
    const mongoMatch = match.matches[0];
    expect(mongoMatch.skill).toBe("MongoDB");
    expect(mongoMatch.candidateStatus).toBe("NOT_FOUND");
    expect(mongoMatch.matchStatus).toBe("NOT_VERIFIED");
    expect(mongoMatch.verificationScore).toBe(0);
    expect(mongoMatch.supportingEvidence).toHaveLength(0);
  });

  // 9. Required coverage calculation
  it("TEST 9: calculates required coverage accurately (PROVEN=100%, PARTIAL=50%, NOT_VERIFIED=0%)", () => {
    const job = extractJobRequirements(FIXTURE_JD);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    // Required: React (PROVEN), Node.js (PROVEN), TypeScript (PROVEN), MongoDB (NOT_VERIFIED)
    // 3 out of 4 = 75.0%
    expect(match.metrics.requiredCounts.total).toBe(4);
    expect(match.metrics.requiredCounts.verified).toBe(3);
    expect(match.metrics.requiredCounts.notVerified).toBe(1);
    expect(match.metrics.requiredCoverage).toBe(75);
  });

  // 10. Preferred coverage calculation
  it("TEST 10: calculates preferred coverage accurately (Docker=0.5, AWS=0, Python=0 out of 3 = 16.7%)", () => {
    const job = extractJobRequirements(FIXTURE_JD);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    // Preferred: Docker (PARTIAL=0.5), AWS (NOT_VERIFIED=0), Python (NOT_VERIFIED=0)
    // 0.5 / 3 = 16.7%
    expect(match.metrics.preferredCounts.total).toBe(3);
    expect(match.metrics.preferredCounts.partial).toBe(1);
    expect(match.metrics.preferredCounts.notVerified).toBe(2);
    expect(match.metrics.preferredCoverage).toBe(16.7);
  });

  // 11. Overall coverage calculation
  it("TEST 11: calculates overall coverage across all requirements (3.5 / 7 = 50.0%)", () => {
    const job = extractJobRequirements(FIXTURE_JD);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    // (3 PROVEN + 0.5 PARTIAL) / 7 Total = 3.5 / 7 = 50.0%
    expect(match.metrics.totalRequirements).toBe(7);
    expect(match.metrics.overallCoverage).toBe(50);
  });

  // 12. Evidence links preserved
  it("TEST 12: preserves authentic Phase 3 sourceUrl, repositoryName, and filePath", () => {
    const text = `Required Skills:\n- React`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    const reactMatch = match.matches[0];
    expect(reactMatch.supportingEvidence.length).toBeGreaterThan(0);
    for (const ev of reactMatch.supportingEvidence) {
      expect(ev.sourceUrl).toMatch(/^https:\/\/github\.com\/pratyushwakde24-source/);
      expect(ev.repositoryName).toBeTruthy();
      expect(ev.extractedFact).toBeTruthy();
    }
  });

  // 13. Respects existing Phase 4 evaluation status
  it("TEST 13: strictly uses the active session evaluation status without re-scoring", () => {
    const text = `Required Skills:\n- React\n- Docker\n- AWS`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    const statusMap = Object.fromEntries(match.matches.map((m) => [m.skill, m.candidateStatus]));
    expect(statusMap["React"]).toBe("PROVEN");
    expect(statusMap["Docker"]).toBe("PARTIAL");
    expect(statusMap["AWS"]).toBe("CLAIMED_ONLY");
  });

  // 14. No fabricated evidence
  it("TEST 14: never creates fake evidence nodes or URLs for unverified requirements", () => {
    const text = `Required Skills:\n- Redis\n- C++\n- Java`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    for (const m of match.matches) {
      expect(m.matchStatus).toBe("NOT_VERIFIED");
      expect(m.supportingEvidence).toHaveLength(0);
      expect(m.repositoryCount).toBe(0);
      expect(m.verificationScore).toBe(0);
    }
  });

  // 15. JD validation schema
  it("TEST 15: accepts valid job description payload", () => {
    const parsed = analyzeJobDescriptionSchema.parse({
      title: "Senior Full Stack Engineer",
      description: "We are seeking a seasoned engineer with React, Node.js, and TypeScript experience.",
    });
    expect(parsed.title).toBe("Senior Full Stack Engineer");
    expect(parsed.description).toContain("React");
  });

  // 16. Oversized JD rejection
  it("TEST 16: rejects oversized job description payloads (> 50,000 characters)", () => {
    const oversized = "React ".repeat(11000); // > 60,000 chars
    expect(() =>
      analyzeJobDescriptionSchema.parse({
        description: oversized,
      })
    ).toThrow(`Job description cannot exceed ${MAX_JD_LENGTH.toLocaleString()} characters.`);
  });

  // 17. Empty / whitespace JD rejection
  it("TEST 17: rejects empty or whitespace-only job description", () => {
    expect(() =>
      analyzeJobDescriptionSchema.parse({
        description: "   ",
      })
    ).toThrow("Job description must be at least 10 characters.");

    expect(() =>
      analyzeJobDescriptionSchema.parse({
        description: "short",
      })
    ).toThrow("Job description must be at least 10 characters.");
  });

  // 18. SECTION 22 FIXTURE VALIDATION
  it("TEST 18: executes the exact prompt Section 22 fixture and matches expected requirements and coverage", () => {
    const job = extractJobRequirements(FIXTURE_JD, "Full Stack Developer");

    // Expected normalized requirements:
    // REQUIRED: React, Node.js, TypeScript, MongoDB
    // PREFERRED: Docker, AWS, Python
    expect(job.requiredSkills).toEqual(["React", "Node.js", "TypeScript", "MongoDB"]);
    expect(job.preferredSkills).toEqual(["Docker", "AWS", "Python"]);

    const match = matchJobRequirements(job, SAMPLE_SESSION);

    // Verify individual match statuses
    const findMatch = (skill: string) => match.matches.find((m) => m.skill === skill)!;

    expect(findMatch("React").matchStatus).toBe("VERIFIED_MATCH");
    expect(findMatch("Node.js").matchStatus).toBe("VERIFIED_MATCH");
    expect(findMatch("TypeScript").matchStatus).toBe("VERIFIED_MATCH");
    expect(findMatch("MongoDB").matchStatus).toBe("NOT_VERIFIED");

    expect(findMatch("Docker").matchStatus).toBe("PARTIAL_MATCH");
    expect(findMatch("AWS").matchStatus).toBe("NOT_VERIFIED");
    expect(findMatch("Python").matchStatus).toBe("NOT_VERIFIED");

    // Verify percentages from prompt Section 11 & 22:
    // Required Coverage: 75%
    // Preferred Coverage: 16.7%
    // Overall Coverage: 50%
    expect(match.metrics.requiredCoverage).toBe(75);
    expect(match.metrics.preferredCoverage).toBe(16.7);
    expect(match.metrics.overallCoverage).toBe(50);
  });
});
