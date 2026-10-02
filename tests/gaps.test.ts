import { describe, expect, it } from "vitest";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import { extractJobRequirements, matchJobRequirements } from "@/lib/jobs";
import {
  detectSkillGaps,
  determineGapPriority,
  skillGapSchema,
  skillGapSummarySchema,
} from "@/lib/gaps";

describe("Phase 8 — Skill Gap Detection", () => {
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

  // 1. PROVEN produces NO GAP
  it("TEST 1: maps PROVEN candidate skill to NO GAP (gapType: NONE)", () => {
    const job = extractJobRequirements("Required Skills:\n- React");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(result.verifiedRequirements).toHaveLength(1);
    const reactGap = result.verifiedRequirements[0];
    expect(reactGap.skill).toBe("React");
    expect(reactGap.gapType).toBe("NONE");
    expect(reactGap.candidateStatus).toBe("PROVEN");
    expect(reactGap.verificationScore).toBe(100);
  });

  // 2. PARTIAL produces PARTIAL GAP
  it("TEST 2: maps PARTIAL candidate skill to PARTIAL GAP (gapType: PARTIAL)", () => {
    const job = extractJobRequirements("Preferred Skills:\n- Docker");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(result.gaps).toHaveLength(1);
    const dockerGap = result.gaps[0];
    expect(dockerGap.skill).toBe("Docker");
    expect(dockerGap.gapType).toBe("PARTIAL");
    expect(dockerGap.candidateStatus).toBe("PARTIAL");
    expect(dockerGap.verificationScore).toBe(50);
  });

  // 3. CLAIMED_ONLY produces EVIDENCE GAP
  it("TEST 3: maps CLAIMED_ONLY candidate skill to EVIDENCE GAP (gapType: EVIDENCE_GAP)", () => {
    const job = extractJobRequirements("Preferred Skills:\n- Python");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(result.gaps).toHaveLength(1);
    const pythonGap = result.gaps[0];
    expect(pythonGap.skill).toBe("Python");
    expect(pythonGap.gapType).toBe("EVIDENCE_GAP");
    expect(pythonGap.candidateStatus).toBe("CLAIMED_ONLY");
    expect(pythonGap.explanation).toBe("No sufficient GitHub evidence currently verifies Python.");
  });

  // 4. NOT_FOUND produces EVIDENCE GAP
  it("TEST 4: maps NOT_FOUND unmentioned skill to EVIDENCE GAP without fake evidence", () => {
    const job = extractJobRequirements("Required Skills:\n- MongoDB");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(result.gaps).toHaveLength(1);
    const mongoGap = result.gaps[0];
    expect(mongoGap.skill).toBe("MongoDB");
    expect(mongoGap.gapType).toBe("EVIDENCE_GAP");
    expect(mongoGap.candidateStatus).toBe("NOT_FOUND");
    expect(mongoGap.evidenceCount).toBe(0);
    expect(mongoGap.supportingEvidence).toHaveLength(0);
    expect(mongoGap.explanation).toBe("No sufficient GitHub evidence currently verifies MongoDB.");
  });

  // 5. REQUIRED + NOT VERIFIED = HIGH
  it("TEST 5: assigns HIGH priority to REQUIRED + NOT VERIFIED requirements", () => {
    expect(determineGapPriority("REQUIRED", "EVIDENCE_GAP")).toBe("HIGH");

    const job = extractJobRequirements("Required Skills:\n- MongoDB");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    const mongoGap = result.gaps.find((g) => g.skill === "MongoDB");
    expect(mongoGap?.priority).toBe("HIGH");
  });

  // 6. REQUIRED + PARTIAL = MEDIUM
  it("TEST 6: assigns MEDIUM priority to REQUIRED + PARTIAL requirements", () => {
    expect(determineGapPriority("REQUIRED", "PARTIAL")).toBe("MEDIUM");

    const job = extractJobRequirements("Required Skills:\n- Docker");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    const dockerGap = result.gaps.find((g) => g.skill === "Docker");
    expect(dockerGap?.priority).toBe("MEDIUM");
  });

  // 7. PREFERRED + NOT VERIFIED = LOW
  it("TEST 7: assigns LOW priority to PREFERRED + NOT VERIFIED requirements", () => {
    expect(determineGapPriority("PREFERRED", "EVIDENCE_GAP")).toBe("LOW");

    const job = extractJobRequirements("Preferred Skills:\n- AWS");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    const awsGap = result.gaps.find((g) => g.skill === "AWS");
    expect(awsGap?.priority).toBe("LOW");
  });

  // 8. PREFERRED + PARTIAL = LOW
  it("TEST 8: assigns LOW priority to PREFERRED + PARTIAL requirements", () => {
    expect(determineGapPriority("PREFERRED", "PARTIAL")).toBe("LOW");

    const job = extractJobRequirements("Preferred Skills:\n- Docker");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    const dockerGap = result.gaps.find((g) => g.skill === "Docker");
    expect(dockerGap?.priority).toBe("LOW");
  });

  // 9. Required/Preferred classification preserved
  it("TEST 9: strictly preserves requirementType on all detected gaps", () => {
    const job = extractJobRequirements(FIXTURE_JD);
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    const mongo = result.all.find((g) => g.skill === "MongoDB");
    const docker = result.all.find((g) => g.skill === "Docker");
    expect(mongo?.requirementType).toBe("REQUIRED");
    expect(docker?.requirementType).toBe("PREFERRED");
  });

  // 10. Evidence preserved for partial gaps
  it("TEST 10: preserves factual Phase 3 evidence for PARTIAL gaps", () => {
    const job = extractJobRequirements("Preferred Skills:\n- Docker");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    const dockerGap = result.gaps.find((g) => g.skill === "Docker");
    expect(dockerGap?.supportingEvidence.length).toBeGreaterThan(0);
    expect(dockerGap?.repositoryCount).toBeGreaterThan(0);
    expect(dockerGap?.supportingEvidence.some((e) => e.type === "dockerfile")).toBe(true);
  });

  // 11. No evidence fabricated for unverified skills
  it("TEST 11: ensures zero fabricated evidence for EVIDENCE_GAP skills", () => {
    const job = extractJobRequirements("Required Skills:\n- MongoDB\nPreferred Skills:\n- AWS");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    for (const gap of result.gaps) {
      expect(gap.gapType).toBe("EVIDENCE_GAP");
      expect(gap.evidenceCount).toBe(0);
      expect(gap.supportingEvidence).toHaveLength(0);
      expect(gap.repositoryCount).toBe(0);
    }
  });

  // 12. Existing Phase 7 coverage values remain unchanged
  it("TEST 12: leaves Phase 7 coverage calculations completely untouched", () => {
    const job = extractJobRequirements(FIXTURE_JD);
    const match = matchJobRequirements(job, SAMPLE_SESSION);

    expect(match.metrics.requiredCoverage).toBe(75);
    expect(match.metrics.preferredCoverage).toBe(16.7);
    expect(match.metrics.overallCoverage).toBe(50);

    const gapResult = detectSkillGaps(match);
    expect(gapResult.summary.totalRequirements).toBe(match.metrics.totalRequirements);
    expect(gapResult.summary.verifiedCount).toBe(
      match.metrics.requiredCounts.verified + match.metrics.preferredCounts.verified
    );
  });

  // 13. Empty gap list works (when all requirements are verified)
  it("TEST 13: handles scenario with zero skill gaps cleanly", () => {
    const job = extractJobRequirements("Required Skills:\n- React\n- Node.js");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(result.gaps).toHaveLength(0);
    expect(result.verifiedRequirements).toHaveLength(2);
    expect(result.summary.evidenceGapCount).toBe(0);
    expect(result.summary.partialCount).toBe(0);
    expect(result.summary.highPriorityCount).toBe(0);
  });

  // 14. All requirements verified works
  it("TEST 14: correctly records verifiedCount when all requirements are proven", () => {
    const job = extractJobRequirements("Required Skills:\n- React\n- Node.js\n- TypeScript");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(result.summary.verifiedCount).toBe(3);
    expect(result.summary.totalRequirements).toBe(3);
    expect(result.gaps).toHaveLength(0);
  });

  // 15. Multiple gaps are correctly summarized
  it("TEST 15: accurately aggregates summary metrics across complex job requirements", () => {
    const job = extractJobRequirements(FIXTURE_JD);
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(result.summary.totalRequired).toBe(4);
    expect(result.summary.totalPreferred).toBe(3);
    expect(result.summary.totalRequirements).toBe(7);

    expect(result.summary.verifiedCount).toBe(3); // React, Node.js, TypeScript
    expect(result.summary.partialCount).toBe(1); // Docker
    expect(result.summary.evidenceGapCount).toBe(3); // MongoDB, AWS, Python

    expect(result.summary.highPriorityCount).toBe(1); // MongoDB (REQUIRED + NOT VERIFIED)
    expect(result.summary.mediumPriorityCount).toBe(0); // 0 required partials
    expect(result.summary.lowPriorityCount).toBe(3); // Docker (preferred partial) + AWS (preferred gap) + Python (preferred gap)
  });

  // 16. Sorts gaps deterministically by priority: HIGH -> MEDIUM -> LOW
  it("TEST 16: sorts gaps array by priority order HIGH first, then MEDIUM, then LOW", () => {
    const text = `Required Skills:
- React
- Docker
- MongoDB

Preferred Skills:
- AWS`;
    const job = extractJobRequirements(text);
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    // Gaps:
    // MongoDB: REQUIRED + EVIDENCE_GAP -> HIGH
    // Docker: REQUIRED + PARTIAL -> MEDIUM
    // AWS: PREFERRED + EVIDENCE_GAP -> LOW
    expect(result.gaps[0].skill).toBe("MongoDB");
    expect(result.gaps[0].priority).toBe("HIGH");

    expect(result.gaps[1].skill).toBe("Docker");
    expect(result.gaps[1].priority).toBe("MEDIUM");

    expect(result.gaps[2].skill).toBe("AWS");
    expect(result.gaps[2].priority).toBe("LOW");
  });

  // 17. Zod schemas validate gap data structure
  it("TEST 17: validates output data with Zod schemas", () => {
    const job = extractJobRequirements(FIXTURE_JD);
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    expect(() => skillGapSummarySchema.parse(result.summary)).not.toThrow();
    for (const gap of result.gaps) {
      expect(() => skillGapSchema.parse(gap)).not.toThrow();
    }
  });

  // 18. SECTION 23 & 24 SAMPLE TEST FIXTURE VALIDATION
  it("TEST 18: executes the exact prompt Section 23/24 fixture and verifies gap classifications", () => {
    const job = extractJobRequirements(FIXTURE_JD, "Full Stack Developer");
    const match = matchJobRequirements(job, SAMPLE_SESSION);
    const result = detectSkillGaps(match);

    const findItem = (skill: string) => result.all.find((g) => g.skill === skill)!;

    // React: PROVEN -> VERIFIED / NO GAP
    expect(findItem("React").gapType).toBe("NONE");
    expect(findItem("React").candidateStatus).toBe("PROVEN");

    // Node.js: PROVEN -> VERIFIED / NO GAP
    expect(findItem("Node.js").gapType).toBe("NONE");
    expect(findItem("Node.js").candidateStatus).toBe("PROVEN");

    // TypeScript: PROVEN -> VERIFIED / NO GAP
    expect(findItem("TypeScript").gapType).toBe("NONE");
    expect(findItem("TypeScript").candidateStatus).toBe("PROVEN");

    // MongoDB: NOT VERIFIED -> EVIDENCE GAP -> HIGH priority because REQUIRED
    expect(findItem("MongoDB").gapType).toBe("EVIDENCE_GAP");
    expect(findItem("MongoDB").priority).toBe("HIGH");

    // Docker: PARTIAL -> PARTIAL GAP -> LOW priority because PREFERRED
    expect(findItem("Docker").gapType).toBe("PARTIAL");
    expect(findItem("Docker").priority).toBe("LOW");

    // AWS: NOT VERIFIED -> EVIDENCE GAP -> LOW priority because PREFERRED
    expect(findItem("AWS").gapType).toBe("EVIDENCE_GAP");
    expect(findItem("AWS").priority).toBe("LOW");

    // Python: NOT VERIFIED -> EVIDENCE GAP -> LOW priority because PREFERRED
    expect(findItem("Python").gapType).toBe("EVIDENCE_GAP");
    expect(findItem("Python").priority).toBe("LOW");
  });
});
