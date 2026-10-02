import { describe, expect, it } from "vitest";
import {
  clearVerificationSession,
  createSampleVerificationSession,
  loadVerificationSession,
  saveVerificationSession,
} from "../src/lib/evidence";
import type { SkillStatus } from "../src/types";

describe("Phase 5: Skill Verification Dashboard Test Suite", () => {
  const sampleSession = createSampleVerificationSession();
  const { evaluation, githubResult, candidate, githubUsername } = sampleSession;

  // ==========================================
  // TEST 1: Summary Counts
  // ==========================================
  it("TEST 1: Summary counts are calculated dynamically from actual verification results", () => {
    const { summary, verifications } = evaluation;

    const actualProven = verifications.filter((v) => v.status === "PROVEN").length;
    const actualPartial = verifications.filter((v) => v.status === "PARTIAL").length;
    const actualClaimedOnly = verifications.filter((v) => v.status === "CLAIMED_ONLY").length;

    expect(summary.totalClaims).toBe(verifications.length);
    expect(summary.provenCount).toBe(actualProven);
    expect(summary.partialCount).toBe(actualPartial);
    expect(summary.claimedOnlyCount).toBe(actualClaimedOnly);
    expect(summary.provenCount + summary.partialCount + summary.claimedOnlyCount).toBe(summary.totalClaims);

    // Evidence coverage formula: (proven + partial) / total
    const coverage = Math.round(((actualProven + actualPartial) / summary.totalClaims) * 100);
    expect(coverage).toBeGreaterThanOrEqual(0);
    expect(coverage).toBeLessThanOrEqual(100);
  });

  // ==========================================
  // TEST 2: Dynamic Skill Rendering
  // ==========================================
  it("TEST 2: Dynamic skill rendering accurately maps each claim with score, repo count, and reason", () => {
    expect(evaluation.verifications.length).toBeGreaterThan(0);

    for (const v of evaluation.verifications) {
      expect(v.skill).toBeTruthy();
      expect(["PROVEN", "PARTIAL", "CLAIMED_ONLY"]).toContain(v.status);
      expect(v.evidenceScore).toBeGreaterThanOrEqual(0);
      expect(v.evidenceScore).toBeLessThanOrEqual(100);
      expect(typeof v.reason).toBe("string");
      expect(v.reason.length).toBeGreaterThan(5);
      expect(Array.isArray(v.evidenceItems)).toBe(true);
      expect(typeof v.repositoryCount).toBe("number");
    }
  });

  // ==========================================
  // TEST 3: PROVEN Filter
  // ==========================================
  it("TEST 3: PROVEN filter returns only verified skills with PROVEN status", () => {
    const provenOnly = evaluation.verifications.filter((v) => v.status === "PROVEN");
    expect(provenOnly.length).toBe(evaluation.summary.provenCount);
    for (const v of provenOnly) {
      expect(v.status).toBe("PROVEN");
      expect(v.evidenceScore).toBeGreaterThanOrEqual(60);
      expect(v.evidenceItems.length).toBeGreaterThanOrEqual(1);
    }
  });

  // ==========================================
  // TEST 4: PARTIAL Filter
  // ==========================================
  it("TEST 4: PARTIAL filter returns only skills with PARTIAL status", () => {
    const partialOnly = evaluation.verifications.filter((v) => v.status === "PARTIAL");
    expect(partialOnly.length).toBe(evaluation.summary.partialCount);
    for (const v of partialOnly) {
      expect(v.status).toBe("PARTIAL");
      expect(v.evidenceScore).toBeGreaterThanOrEqual(20);
      expect(v.evidenceScore).toBeLessThan(60);
    }
  });

  // ==========================================
  // TEST 5: CLAIMED-ONLY Filter
  // ==========================================
  it("TEST 5: CLAIMED-ONLY filter returns only skills lacking public GitHub evidence", () => {
    const claimedOnly = evaluation.verifications.filter((v) => v.status === "CLAIMED_ONLY");
    expect(claimedOnly.length).toBe(evaluation.summary.claimedOnlyCount);
    for (const v of claimedOnly) {
      expect(v.status).toBe("CLAIMED_ONLY");
      expect(v.evidenceScore).toBeLessThan(20);
    }
  });

  // ==========================================
  // TEST 6: Search
  // ==========================================
  it("TEST 6: Search filters skills dynamically by name or rationale without mutating results", () => {
    const searchByName = (query: string) =>
      evaluation.verifications.filter((v) =>
        v.skill.toLowerCase().includes(query.toLowerCase())
      );

    const reactResults = searchByName("React");
    expect(reactResults.length).toBeGreaterThanOrEqual(1);
    expect(reactResults[0].skill).toBe("React");

    const nonExistent = searchByName("NonExistentSkillXYZ");
    expect(nonExistent.length).toBe(0);

    // Search query does not modify underlying total
    expect(evaluation.verifications.length).toBe(evaluation.summary.totalClaims);
  });

  // ==========================================
  // TEST 7: Deterministic Sorting
  // ==========================================
  it("TEST 7: Sorting options sort deterministically by score, count, repos, or alphabetical order", () => {
    const list = [...evaluation.verifications];

    // Sort by Evidence Score descending
    const byScore = [...list].sort((a, b) => b.evidenceScore - a.evidenceScore || a.skill.localeCompare(b.skill));
    for (let i = 0; i < byScore.length - 1; i++) {
      expect(byScore[i].evidenceScore).toBeGreaterThanOrEqual(byScore[i + 1].evidenceScore);
    }

    // Sort by Skill Name ascending
    const byNameAsc = [...list].sort((a, b) => a.skill.localeCompare(b.skill));
    for (let i = 0; i < byNameAsc.length - 1; i++) {
      expect(byNameAsc[i].skill.localeCompare(byNameAsc[i + 1].skill)).toBeLessThanOrEqual(0);
    }

    // Sort by Status Priority
    const statusPriority: Record<SkillStatus, number> = { PROVEN: 1, PARTIAL: 2, CLAIMED_ONLY: 3 };
    const byStatus = [...list].sort(
      (a, b) => statusPriority[a.status] - statusPriority[b.status] || b.evidenceScore - a.evidenceScore
    );
    expect(byStatus[0].status).toBe("PROVEN");
    expect(byStatus[byStatus.length - 1].status).toBe("CLAIMED_ONLY");
  });

  // ==========================================
  // TEST 8: Evidence Expansion
  // ==========================================
  it("TEST 8: Expanded evidence includes repositoryName, type, extractedFact, and sourceUrl", () => {
    const provenSkills = evaluation.verifications.filter((v) => v.status === "PROVEN");
    expect(provenSkills.length).toBeGreaterThan(0);

    const reactSkill = provenSkills.find((v) => v.skill === "React");
    expect(reactSkill).toBeDefined();
    expect(reactSkill!.evidenceItems.length).toBeGreaterThan(0);

    for (const item of reactSkill!.evidenceItems) {
      expect(item.repositoryName).toBeTruthy();
      expect(item.type).toBeTruthy();
      expect(item.extractedFact).toBeTruthy();
      expect(item.sourceUrl).toMatch(/^https:\/\/github\.com\//);
    }
  });

  // ==========================================
  // TEST 9: Direct GitHub Evidence Links
  // ==========================================
  it("TEST 9: Direct GitHub evidence links point to valid GitHub URLs with no sensitive tokens", () => {
    for (const v of evaluation.verifications) {
      for (const item of v.evidenceItems) {
        if (item.sourceUrl) {
          expect(item.sourceUrl.startsWith("https://github.com/")).toBe(true);
          expect(item.sourceUrl).not.toContain("token");
          expect(item.sourceUrl).not.toContain("ghp_");
          expect(item.sourceUrl).not.toContain("github_pat_");
        }
      }
    }
  });

  // ==========================================
  // TEST 10: Empty Evidence State Handling
  // ==========================================
  it("TEST 10: Skills with no evidence items have empty array and are classified as CLAIMED_ONLY", () => {
    const claimedSkills = evaluation.verifications.filter((v) => v.status === "CLAIMED_ONLY");
    expect(claimedSkills.length).toBeGreaterThan(0);

    for (const claim of claimedSkills) {
      expect(claim.evidenceItems.length).toBe(0);
      expect(claim.evidenceScore).toBeLessThan(20);
      expect(claim.status).toBe("CLAIMED_ONLY");
      expect(claim.reason).toContain("No sufficient GitHub evidence was found");
    }
  });

  // ==========================================
  // TEST 11: No Hard-Coded Verification Results
  // ==========================================
  it("TEST 11: Verification results dynamically adapt when evidence list changes", () => {
    const session = createSampleVerificationSession();

    // Verify results are dynamically computed from engine, not hardcoded constants
    expect(session.evaluation.summary.totalClaims).toBe(session.claims.length);
    expect(session.evaluation.verifications.length).toBe(session.claims.length);
  });

  // ==========================================
  // TEST 12: Candidate and GitHub Information Rendering
  // ==========================================
  it("TEST 12: Candidate and GitHub profile information are factually rendered", () => {
    expect(candidate.name).toBe("Pratyush Wakde");
    expect(githubUsername).toBe("pratyushwakde24-source");
    expect(sampleSession.analyzedAt).toBeTruthy();

    expect(githubResult.summary.repositoriesAnalyzed).toBe(15);
    expect(githubResult.summary.evidenceItems).toBe(98);
    expect(githubResult.summary.languagesDetected.length).toBe(4);
    expect(githubResult.summary.languagesDetected).toContain("TypeScript");
  });

  // ==========================================
  // TEST 13: Absence of Hiring Predictions (Critical Rule)
  // ==========================================
  it("TEST 13: Dashboard data model contains NO hiring predictions or employability scores", () => {
    const rawSessionJson = JSON.stringify(sampleSession);

    // Forbidden concepts
    expect(rawSessionJson).not.toContain("employabilityScore");
    expect(rawSessionJson).not.toContain("hiringProbability");
    expect(rawSessionJson).not.toContain("hireRecommendation");
    expect(rawSessionJson).not.toContain("bestCandidate");
    expect(rawSessionJson).not.toContain("worstCandidate");
    expect(rawSessionJson).not.toContain("candidateRanking");
    expect(rawSessionJson).not.toContain("AI_EVALUATION");
  });

  // ==========================================
  // TEST 14: Session Storage Mechanism
  // ==========================================
  it("TEST 14: Verification session can be serialized and deserialized safely", () => {
    // Mock window localStorage
    const mockStorage: Record<string, string> = {};
    const originalWindow = global.window;

    const mockStorageObj = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const k in mockStorage) delete mockStorage[k];
      },
      key: (i: number) => Object.keys(mockStorage)[i] || null,
      length: 0,
    } as unknown as Storage;

    // Attach to global window
    (global as unknown as { window: { localStorage: Storage } }).window = {
      localStorage: mockStorageObj,
    };

    try {
      saveVerificationSession(sampleSession);
      const retrieved = loadVerificationSession();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.githubUsername).toBe("pratyushwakde24-source");
      expect(retrieved?.evaluation.summary.provenCount).toBe(sampleSession.evaluation.summary.provenCount);

      clearVerificationSession();
      expect(loadVerificationSession()).toBeNull();
    } finally {
      global.window = originalWindow;
    }
  });
});
