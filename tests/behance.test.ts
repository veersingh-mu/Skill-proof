/**
 * Phase 13: Behance Claim Verification Unit & Integration Tests.
 *
 * Tests the entire creative verification pipeline deterministically:
 * 1. URL parsing & normalization
 * 2. Invalid URL & SSRF protection
 * 3. Project URL parsing
 * 4. Provider abstraction & error handling
 * 5. Creative skill detection & normalization
 * 6. Evidence creation with provider="behance"
 * 7. Evidence deduplication
 * 8. Deterministic Evidence Engine scoring
 * 9. Status transitions (PROVEN / PARTIAL / CLAIMED_ONLY)
 * 10. Re-analysis & evidence diffing
 * 11. Evidence Graph integration
 * 12. Job Matching integration
 * 13. Skill Gap integration
 * 14. Prompt Specific Tests (TEST 1 to TEST 9)
 */

import { describe, expect, it } from "vitest";
import {
  parseBehanceProfileUrl,
  parseBehanceProjectUrl,
  isBehanceProfileUrl,
  BehanceUrlError,
} from "@/lib/behance/parse-url";
import {
  DemoBehanceProvider,
  LiveBehanceProvider,
  BehanceProviderError,
} from "@/lib/behance/client";
import {
  detectCreativeEvidence,
  detectionsToEvidence,
} from "@/lib/behance/detectors/creative-detectors";
import { diffBehanceEvidence } from "@/lib/behance/diff";
import {
  behanceProfileSchema,
  behanceProjectSchema,
  behanceAnalyzeRequestSchema,
  behanceAnalyzeResponseSchema,
} from "@/lib/behance/schemas";
import { normalizeSkill } from "@/lib/resume/normalize";
import { evaluateEvidence, evaluateSkillClaim } from "@/lib/evidence/engine";
import { buildEvidenceGraph } from "@/lib/evidence/graph";
import { matchJobRequirements } from "@/lib/jobs/matcher";
import { detectSkillGaps } from "@/lib/gaps/detector";
import type { CandidateVerificationSession } from "@/lib/evidence/session";
import type { BehanceProject } from "@/types/behance";
import type { GitHubEvidenceItem, ResumeClaim } from "@/types";

describe("Phase 13 — Behance Claim Verification Test Suite", () => {
  // -------------------------------------------------------------------------
  // 1 & 2: URL Parsing & Normalization
  // -------------------------------------------------------------------------
  describe("1 & 2: Behance URL Parsing & Normalization", () => {
    it("normalizes standard https Behance profile URLs", () => {
      const parsed = parseBehanceProfileUrl("https://www.behance.net/creativepro");
      expect(parsed.username).toBe("creativepro");
      expect(parsed.normalizedUrl).toBe("https://www.behance.net/creativepro");
    });

    it("normalizes URLs with trailing slash", () => {
      const parsed = parseBehanceProfileUrl("https://www.behance.net/creativepro/");
      expect(parsed.username).toBe("creativepro");
      expect(parsed.normalizedUrl).toBe("https://www.behance.net/creativepro");
    });

    it("normalizes URLs without www or protocol", () => {
      const parsed = parseBehanceProfileUrl("behance.net/designer123");
      expect(parsed.username).toBe("designer123");
      expect(parsed.normalizedUrl).toBe("https://www.behance.net/designer123");
    });

    it("normalizes bare username or @username", () => {
      const parsed = parseBehanceProfileUrl("@sarah_designs");
      expect(parsed.username).toBe("sarah_designs");
      expect(parsed.normalizedUrl).toBe("https://www.behance.net/sarah_designs");
    });
  });

  // -------------------------------------------------------------------------
  // 3 & 20: Invalid URL Rejection & SSRF Protection
  // -------------------------------------------------------------------------
  describe("3 & 20: Invalid URL Rejection & SSRF Protection", () => {
    it("rejects non-Behance external domains (SSRF protection)", () => {
      expect(() => parseBehanceProfileUrl("https://malicious-site.com/user")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("https://github.com/user")).toThrow(BehanceUrlError);
    });

    it("rejects dangerous URI schemes (SSRF & XSS protection)", () => {
      expect(() => parseBehanceProfileUrl("javascript:alert(1)")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("data:text/html,<html>")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("file:///etc/passwd")).toThrow(BehanceUrlError);
    });

    it("rejects localhost and internal IP addresses", () => {
      expect(() => parseBehanceProfileUrl("http://localhost:3000")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("http://127.0.0.1")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("http://169.254.169.254")).toThrow(BehanceUrlError);
    });

    it("rejects empty, whitespace, or missing URL", () => {
      expect(() => parseBehanceProfileUrl("")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("   ")).toThrow(BehanceUrlError);
    });

    it("rejects reserved Behance non-profile paths", () => {
      expect(() => parseBehanceProfileUrl("https://www.behance.net/search")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("https://www.behance.net/pro")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProfileUrl("https://www.behance.net/signin")).toThrow(BehanceUrlError);
    });
  });

  // -------------------------------------------------------------------------
  // 4: Project URL Parsing
  // -------------------------------------------------------------------------
  describe("4: Behance Project URL Parsing", () => {
    it("parses legitimate gallery project URLs", () => {
      const parsed = parseBehanceProjectUrl("https://www.behance.net/gallery/180001/Brand-Identity");
      expect(parsed.projectId).toBe("180001");
      expect(parsed.slug).toBe("Brand-Identity");
      expect(parsed.normalizedUrl).toBe("https://www.behance.net/gallery/180001/Brand-Identity");
    });

    it("rejects invalid project URLs", () => {
      expect(() => parseBehanceProjectUrl("https://www.behance.net/gallery/not-a-number/slug")).toThrow(BehanceUrlError);
      expect(() => parseBehanceProjectUrl("https://www.behance.net/gallery/")).toThrow(BehanceUrlError);
    });

    it("identifies profile URLs vs project URLs", () => {
      expect(isBehanceProfileUrl("https://www.behance.net/designer")).toBe(true);
      expect(isBehanceProfileUrl("https://www.behance.net/gallery/123/brand")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 5: Provider Error Handling
  // -------------------------------------------------------------------------
  describe("5: Provider Error Handling", () => {
    it("LiveBehanceProvider reports unavailable status honestly", async () => {
      const live = new LiveBehanceProvider();
      expect(live.isAvailable).toBe(false);
      await expect(live.getProfile("johndoe")).rejects.toThrow(BehanceProviderError);
    });

    it("DemoBehanceProvider returns deterministic data safely", async () => {
      const demo = new DemoBehanceProvider();
      expect(demo.isAvailable).toBe(true);
      const profile = await demo.getProfile("creative_alex");
      expect(profile.username).toBe("creative_alex");
      expect(profile.projectCount).toBeGreaterThan(0);

      const projects = await demo.getProjects("creative_alex", 5);
      expect(projects.length).toBeLessThanOrEqual(5);
    });
  });

  // -------------------------------------------------------------------------
  // 6 & 7: Creative Skill Taxonomy & Normalization
  // -------------------------------------------------------------------------
  describe("6 & 7: Creative Skill Normalization", () => {
    it("normalizes creative aliases to canonical skills", () => {
      expect(normalizeSkill("Graphic Designer")?.canonicalName).toBe("Graphic Design");
      expect(normalizeSkill("Visual Design")?.canonicalName).toBe("Graphic Design");
      expect(normalizeSkill("Brand Identity")?.canonicalName).toBe("Branding");
      expect(normalizeSkill("Corporate Identity")?.canonicalName).toBe("Branding");
      expect(normalizeSkill("Logo Designer")?.canonicalName).toBe("Logo Design");
      expect(normalizeSkill("User Interface")?.canonicalName).toBe("UI Design");
      expect(normalizeSkill("User Experience")?.canonicalName).toBe("UX Design");
      expect(normalizeSkill("Type Design")?.canonicalName).toBe("Typography");
      expect(normalizeSkill("Digital Illustration")?.canonicalName).toBe("Illustration");
      expect(normalizeSkill("Packaging")?.canonicalName).toBe("Packaging Design");
      expect(normalizeSkill("Motion Design")?.canonicalName).toBe("Motion Graphics");
    });

    it("normalizes creative tool names", () => {
      expect(normalizeSkill("Photoshop")?.canonicalName).toBe("Adobe Photoshop");
      expect(normalizeSkill("Illustrator")?.canonicalName).toBe("Adobe Illustrator");
      expect(normalizeSkill("After Effects")?.canonicalName).toBe("Adobe After Effects");
      expect(normalizeSkill("Figma")?.canonicalName).toBe("Figma");
      expect(normalizeSkill("Blender")?.canonicalName).toBe("Blender");
      expect(normalizeSkill("Canva")?.canonicalName).toBe("Canva");
    });
  });

  // -------------------------------------------------------------------------
  // 8 & 19: Schema Validation
  // -------------------------------------------------------------------------
  describe("8 & 19: Schema Validation", () => {
    it("validates valid profile and project schemas", () => {
      const validProfile = {
        username: "artdirector",
        displayName: "Art Director",
        profileUrl: "https://www.behance.net/artdirector",
        projectCount: 5,
      };
      expect(behanceProfileSchema.safeParse(validProfile).success).toBe(true);

      const validProject = {
        id: "101",
        title: "Brand Book",
        url: "https://www.behance.net/gallery/101/brand-book",
        description: "Comprehensive corporate guidelines.",
        categories: ["Branding", "Graphic Design"],
        tags: ["logo", "typography"],
        publishedAt: "2026-01-01T00:00:00Z",
        modifiedAt: null,
        mediaCount: 14,
        coverImageUrl: null,
      };
      expect(behanceProjectSchema.safeParse(validProject).success).toBe(true);
    });

    it("validates request schema", () => {
      expect(behanceAnalyzeRequestSchema.safeParse({ profileUrl: "https://www.behance.net/user" }).success).toBe(true);
      expect(behanceAnalyzeRequestSchema.safeParse({ profileUrl: "" }).success).toBe(false);
    });

    it("validates analyze response schema", () => {
      const validResponse = {
        profile: {
          username: "designer",
          profileUrl: "https://www.behance.net/designer",
          displayName: "Designer",
          avatarUrl: null,
          projectCount: 1,
        },
        projects: [],
        evidence: [],
        summary: {
          projectsDiscovered: 1,
          projectsAnalyzed: 1,
          evidenceItems: 0,
          skillHintsDetected: [],
        },
      };
      expect(behanceAnalyzeResponseSchema.safeParse(validResponse).success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 17 & 18: Re-analysis & Evidence Diffing
  // -------------------------------------------------------------------------
  describe("17 & 18: Re-analysis & Evidence Diffing", () => {
    it("correctly identifies NEW, REMOVED, and UNCHANGED evidence items", () => {
      const prev: GitHubEvidenceItem[] = [
        {
          id: "e1",
          repositoryId: "p1",
          repositoryName: "Project 1",
          type: "behance_graphic_design",
          skillHints: ["Graphic Design"],
          sourceUrl: "https://www.behance.net/gallery/1/p1",
          extractedFact: "Poster design in Project 1",
          collectedAt: "2026-01-01T00:00:00Z",
          analyzerVersion: "1.0.0",
          provider: "behance",
        },
        {
          id: "e2",
          repositoryId: "p2",
          repositoryName: "Project 2",
          type: "behance_branding",
          skillHints: ["Branding"],
          sourceUrl: "https://www.behance.net/gallery/2/p2",
          extractedFact: "Brand identity in Project 2",
          collectedAt: "2026-01-01T00:00:00Z",
          analyzerVersion: "1.0.0",
          provider: "behance",
        },
      ];

      const current: GitHubEvidenceItem[] = [
        // e1 unchanged
        {
          id: "e1-new",
          repositoryId: "p1",
          repositoryName: "Project 1",
          type: "behance_graphic_design",
          skillHints: ["Graphic Design"],
          sourceUrl: "https://www.behance.net/gallery/1/p1",
          extractedFact: "Poster design in Project 1",
          collectedAt: "2026-02-01T00:00:00Z",
          analyzerVersion: "1.0.0",
          provider: "behance",
        },
        // e3 is brand new project!
        {
          id: "e3",
          repositoryId: "p3",
          repositoryName: "Project 3",
          type: "behance_packaging",
          skillHints: ["Packaging Design"],
          sourceUrl: "https://www.behance.net/gallery/3/p3",
          extractedFact: "Tea packaging in Project 3",
          collectedAt: "2026-02-01T00:00:00Z",
          analyzerVersion: "1.0.0",
          provider: "behance",
        },
      ];

      const diff = diffBehanceEvidence(prev, current);
      expect(diff.summary.unchangedCount).toBe(1);
      expect(diff.summary.newCount).toBe(1);
      expect(diff.summary.removedCount).toBe(1);
      expect(diff.summary.newProjectsCount).toBe(1);
      expect(diff.newItems[0].repositoryName).toBe("Project 3");
      expect(diff.removedItems[0].repositoryName).toBe("Project 2");
    });
  });

  // -------------------------------------------------------------------------
  // TEST CASES 1 TO 9 (AS SPECIFIED IN PROMPT)
  // -------------------------------------------------------------------------
  describe("Prompt Specific Test Cases (TEST 1 to TEST 9)", () => {
    const fixtureProject1: BehanceProject = {
      id: "9001",
      title: "Fintech Brand Identity & Visual System",
      url: "https://www.behance.net/gallery/9001/fintech-brand",
      description: "Complete visual identity, logo design, and marketing collateral created with Adobe Illustrator and Photoshop.",
      categories: ["Branding", "Graphic Design"],
      tags: ["brand identity", "logo design", "graphic design", "typography", "photoshop", "illustrator"],
      publishedAt: "2026-01-01T00:00:00Z",
      modifiedAt: null,
      mediaCount: 15,
      coverImageUrl: null,
    };

    const fixtureProject2: BehanceProject = {
      id: "9002",
      title: "Packaging and Poster Exhibition",
      url: "https://www.behance.net/gallery/9002/poster-exhibition",
      description: "Graphic design posters and product packaging design.",
      categories: ["Packaging", "Graphic Design"],
      tags: ["poster", "packaging design", "graphic design", "print design"],
      publishedAt: "2026-01-10T00:00:00Z",
      modifiedAt: null,
      mediaCount: 10,
      coverImageUrl: null,
    };

    const fixtureProjectUI1: BehanceProject = {
      id: "9003",
      title: "Crypto Wallet Mobile App UI",
      url: "https://www.behance.net/gallery/9003/crypto-wallet",
      description: "UI design and dashboard design in Figma with complete design system.",
      categories: ["UI/UX"],
      tags: ["ui design", "mobile app", "dashboard", "figma", "design system"],
      publishedAt: "2026-02-01T00:00:00Z",
      modifiedAt: null,
      mediaCount: 12,
      coverImageUrl: null,
    };

    const fixtureProjectUI2: BehanceProject = {
      id: "9004",
      title: "SaaS Analytics Dashboard UI",
      url: "https://www.behance.net/gallery/9004/saas-dashboard",
      description: "Clean user interface design for web application with design system.",
      categories: ["UI/UX"],
      tags: ["ui design", "interface design", "web design", "figma"],
      publishedAt: "2026-02-15T00:00:00Z",
      modifiedAt: null,
      mediaCount: 8,
      coverImageUrl: null,
    };

    // TEST 1
    it("TEST 1: Resume: Graphic Design, Behance: Multiple relevant design projects -> matching evidence exists, status determined by deterministic engine", () => {
      const claim: ResumeClaim = {
        id: "claim-1",
        displayName: "Graphic Design",
        canonicalSkill: "Graphic Design",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const detections1 = detectCreativeEvidence(fixtureProject1);
      const detections2 = detectCreativeEvidence(fixtureProject2);

      const evidence1 = detectionsToEvidence(fixtureProject1, detections1, "https://www.behance.net/alex");
      const evidence2 = detectionsToEvidence(fixtureProject2, detections2, "https://www.behance.net/alex");
      const allEvidence = [...evidence1, ...evidence2];

      const evaluation = evaluateSkillClaim(claim, allEvidence);

      expect(evaluation.evidenceItems.length).toBeGreaterThan(0);
      expect(evaluation.repositoryCount).toBe(2);
      expect(["PROVEN", "PARTIAL"]).toContain(evaluation.status);
      expect(evaluation.evidenceScore).toBeGreaterThan(20);
    });

    // TEST 2
    it("TEST 2: Resume: Graphic Design, Behance: profile exists but no relevant projects -> CLAIMED_ONLY", () => {
      const claim: ResumeClaim = {
        id: "claim-gd",
        displayName: "Graphic Design",
        canonicalSkill: "Graphic Design",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      // Project that has only unrelated tags (e.g. only architecture or non-design)
      const emptyProject: BehanceProject = {
        id: "9999",
        title: "Random Photography Collection",
        url: "https://www.behance.net/gallery/9999/photos",
        description: "Street photography around Berlin.",
        categories: ["Photography"],
        tags: ["street", "berlin", "black and white"],
        publishedAt: "2026-01-01T00:00:00Z",
        modifiedAt: null,
        mediaCount: 5,
        coverImageUrl: null,
      };

      const detections = detectCreativeEvidence(emptyProject);
      const evidence = detectionsToEvidence(emptyProject, detections, "https://www.behance.net/photo");

      const evaluation = evaluateSkillClaim(claim, evidence);
      expect(evaluation.status).toBe("CLAIMED_ONLY");
      expect(evaluation.evidenceScore).toBe(0);
      expect(evaluation.evidenceItems).toHaveLength(0);
    });

    // TEST 3
    it("TEST 3: Resume: Branding, Behance: one relevant branding project -> meaningful evidence, status determined by deterministic engine", () => {
      const claim: ResumeClaim = {
        id: "claim-branding",
        displayName: "Branding",
        canonicalSkill: "Branding",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const detections = detectCreativeEvidence(fixtureProject1);
      const evidence = detectionsToEvidence(fixtureProject1, detections, "https://www.behance.net/alex");

      const evaluation = evaluateSkillClaim(claim, evidence);
      expect(evaluation.evidenceItems.length).toBeGreaterThanOrEqual(1);
      expect(evaluation.evidenceScore).toBeGreaterThan(0);
      expect(["PROVEN", "PARTIAL"]).toContain(evaluation.status);
    });

    // TEST 4
    it("TEST 4: Resume: UI Design, Behance: multiple UI projects -> strong matching evidence", () => {
      const claim: ResumeClaim = {
        id: "claim-ui",
        displayName: "UI Design",
        canonicalSkill: "UI Design",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const detections1 = detectCreativeEvidence(fixtureProjectUI1);
      const detections2 = detectCreativeEvidence(fixtureProjectUI2);
      const evidence = [
        ...detectionsToEvidence(fixtureProjectUI1, detections1, "https://www.behance.net/ui"),
        ...detectionsToEvidence(fixtureProjectUI2, detections2, "https://www.behance.net/ui"),
      ];

      const evaluation = evaluateSkillClaim(claim, evidence);
      expect(evaluation.evidenceItems.length).toBeGreaterThanOrEqual(2);
      expect(evaluation.repositoryCount).toBe(2);
      expect(evaluation.evidenceScore).toBeGreaterThanOrEqual(40);
    });

    // TEST 5
    it("TEST 5: Resume: 3D Design, Behance: no matching evidence -> CLAIMED_ONLY", () => {
      const claim: ResumeClaim = {
        id: "claim-3d",
        displayName: "3D Design",
        canonicalSkill: "3D Design",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const detections = detectCreativeEvidence(fixtureProject1);
      const evidence = detectionsToEvidence(fixtureProject1, detections, "https://www.behance.net/alex");

      const evaluation = evaluateSkillClaim(claim, evidence);
      expect(evaluation.status).toBe("CLAIMED_ONLY");
      expect(evaluation.evidenceScore).toBe(0);
      expect(evaluation.evidenceItems).toHaveLength(0);
    });

    // TEST 6
    it("TEST 6: Same project analyzed twice -> no duplicate evidence", () => {
      const detections = detectCreativeEvidence(fixtureProject1);
      const evidenceRun1 = detectionsToEvidence(fixtureProject1, detections, "https://www.behance.net/alex");
      const evidenceRun2 = detectionsToEvidence(fixtureProject1, detections, "https://www.behance.net/alex");

      const combined = [...evidenceRun1, ...evidenceRun2];
      const claim: ResumeClaim = {
        id: "c1",
        displayName: "Branding",
        canonicalSkill: "Branding",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const evalSingle = evaluateSkillClaim(claim, evidenceRun1);
      const evalDuplicate = evaluateSkillClaim(claim, combined);

      // Deterministic deduplication must ensure score and item counts match
      expect(evalDuplicate.evidenceScore).toBe(evalSingle.evidenceScore);
      expect(evalDuplicate.evidenceItems.length).toBe(evalSingle.evidenceItems.length);
    });

    // TEST 7
    it("TEST 7: GitHub only -> existing behavior unchanged", () => {
      const ghEvidence: GitHubEvidenceItem[] = [
        {
          id: "gh-1",
          repositoryName: "web-app",
          type: "dependency",
          skillHints: ["React"],
          sourceUrl: "https://github.com/user/web-app/blob/main/package.json",
          extractedFact: "React dependency in package.json",
          collectedAt: "2026-01-01T00:00:00Z",
          analyzerVersion: "1.0.0",
          provider: "github",
        },
        {
          id: "gh-2",
          repositoryName: "web-app",
          type: "framework",
          skillHints: ["React"],
          sourceUrl: "https://github.com/user/web-app",
          extractedFact: "React framework structure",
          collectedAt: "2026-01-01T00:00:00Z",
          analyzerVersion: "1.0.0",
          provider: "github",
        },
      ];

      const claim: ResumeClaim = {
        id: "c-react",
        displayName: "React",
        canonicalSkill: "React",
        category: "Frontend",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const evalResult = evaluateSkillClaim(claim, ghEvidence);
      expect(evalResult.status).toBe("PROVEN");
      expect(evalResult.evidenceScore).toBeGreaterThanOrEqual(60);
    });

    // TEST 8
    it("TEST 8: Behance only -> Behance evidence works independently", () => {
      const claim: ResumeClaim = {
        id: "c-logo",
        displayName: "Logo Design",
        canonicalSkill: "Logo Design",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const detections = detectCreativeEvidence(fixtureProject1);
      const behanceEvidence = detectionsToEvidence(fixtureProject1, detections, "https://www.behance.net/user");

      const evalResult = evaluateSkillClaim(claim, behanceEvidence);
      expect(evalResult.evidenceItems.length).toBeGreaterThan(0);
      expect(evalResult.evidenceItems[0].provider).toBe("behance");
      expect(evalResult.status).not.toBe("CLAIMED_ONLY");
    });

    // TEST 9
    it("TEST 9: GitHub + Behance -> both providers appear in unified evidence system", () => {
      const claims: ResumeClaim[] = [
        {
          id: "c-react",
          displayName: "React",
          canonicalSkill: "React",
          category: "Frontend",
          sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
          confidence: 1,
          status: "UNVERIFIED",
        },
        {
          id: "c-brand",
          displayName: "Branding",
          canonicalSkill: "Branding",
          category: "Creative",
          sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
          confidence: 1,
          status: "UNVERIFIED",
        },
      ];

      const ghEvidence: GitHubEvidenceItem[] = [
        {
          id: "gh-1",
          repositoryName: "portfolio-site",
          type: "dependency",
          skillHints: ["React"],
          sourceUrl: "https://github.com/user/portfolio-site",
          extractedFact: "React dependency in package.json",
          collectedAt: "2026-01-01T00:00:00Z",
          analyzerVersion: "1.0.0",
          provider: "github",
        },
      ];

      const detections = detectCreativeEvidence(fixtureProject1);
      const behanceEvidence = detectionsToEvidence(fixtureProject1, detections, "https://www.behance.net/user");

      const combinedEvidence = [...ghEvidence, ...behanceEvidence];
      const evaluation = evaluateEvidence(claims, combinedEvidence);

      const reactVerification = evaluation.verifications.find((v) => v.skill === "React");
      const brandingVerification = evaluation.verifications.find((v) => v.skill === "Branding");

      expect(reactVerification).toBeDefined();
      expect(reactVerification?.evidenceItems.some((e) => e.provider === "github")).toBe(true);

      expect(brandingVerification).toBeDefined();
      expect(brandingVerification?.evidenceItems.some((e) => e.provider === "behance")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 14: Evidence Graph Integration with Behance
  // -------------------------------------------------------------------------
  describe("14: Evidence Graph with Behance Projects", () => {
    it("builds connected graph containing Behance project, evidence, and media nodes", () => {
      const claim: ResumeClaim = {
        id: "c-brand",
        displayName: "Branding",
        canonicalSkill: "Branding",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const project: BehanceProject = {
        id: "5555",
        title: "Acme Rebrand",
        url: "https://www.behance.net/gallery/5555/acme-rebrand",
        description: "Corporate rebrand and brand guidelines.",
        categories: ["Branding"],
        tags: ["brand identity", "logo"],
        publishedAt: "2026-01-01T00:00:00Z",
        modifiedAt: null,
        mediaCount: 16,
        coverImageUrl: null,
      };

      const detections = detectCreativeEvidence(project);
      const evidence = detectionsToEvidence(project, detections, "https://www.behance.net/user");
      const evaluation = evaluateEvidence([claim], evidence);

      const session: CandidateVerificationSession = {
        candidate: { name: "Design Lead" },
        githubUsername: "designlead",
        analyzedAt: "2026-01-01T00:00:00Z",
        claims: [claim],
        githubResult: {
          analysisRunId: "run-1",
          profile: { username: "designlead", name: null, profileUrl: "", avatarUrl: "", publicRepoCount: 0, followers: 0, following: 0, createdAt: "", bio: null },
          summary: { repositoriesAnalyzed: 0, evidenceItems: 0, languagesDetected: [], topSkillHints: [], lastActiveDate: "" },
          repositories: [],
          evidence: [],
        },
        evaluation,
        behanceProfileUrl: "https://www.behance.net/designlead",
      };

      const graph = buildEvidenceGraph(session, { selectedSkill: "Branding" });

      const projectNode = graph.nodes.find((n) => n.type === "repository" && (n.data as { name: string }).name === "Acme Rebrand");
      expect(projectNode).toBeDefined();
      expect((projectNode?.data as { provider?: string }).provider).toBe("behance");

      const evidenceNode = graph.nodes.find((n) => n.type === "evidence" && (n.data as { repositoryName: string }).repositoryName === "Acme Rebrand");
      expect(evidenceNode).toBeDefined();

      const mediaNode = graph.nodes.find((n) => n.type === "artifact");
      expect(mediaNode).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // 15 & 16: Job Matching & Skill Gap Integration with Behance
  // -------------------------------------------------------------------------
  describe("15 & 16: Job Matching & Skill Gap Integration", () => {
    it("correctly matches verified creative skills in Job Matching and creates no gap for PROVEN", () => {
      const claim: ResumeClaim = {
        id: "c-gd",
        displayName: "Graphic Design",
        canonicalSkill: "Graphic Design",
        category: "Creative",
        sourceSection: "SKILLS",
        sourceText: "Claimed in resume",
        confidence: 1,
        status: "UNVERIFIED",
      };

      const project1: BehanceProject = {
        id: "1",
        title: "Posters 1",
        url: "https://www.behance.net/gallery/1/p1",
        description: "Graphic design posters",
        categories: ["Graphic Design"],
        tags: ["graphic design", "poster"],
        publishedAt: null,
        modifiedAt: null,
        mediaCount: 10,
        coverImageUrl: null,
      };

      const project2: BehanceProject = {
        id: "2",
        title: "Posters 2",
        url: "https://www.behance.net/gallery/2/p2",
        description: "Visual design editorial",
        categories: ["Graphic Design"],
        tags: ["graphic design", "editorial design"],
        publishedAt: null,
        modifiedAt: null,
        mediaCount: 10,
        coverImageUrl: null,
      };

      const evidence = [
        ...detectionsToEvidence(project1, detectCreativeEvidence(project1), "https://www.behance.net/u"),
        ...detectionsToEvidence(project2, detectCreativeEvidence(project2), "https://www.behance.net/u"),
      ];

      const evaluation = evaluateEvidence([claim], evidence);

      const session: CandidateVerificationSession = {
        candidate: { name: "Creative Candidate" },
        githubUsername: "creative",
        analyzedAt: "2026-01-01T00:00:00Z",
        claims: [claim],
        githubResult: {
          analysisRunId: "run-creative",
          profile: { username: "creative", name: null, profileUrl: "", avatarUrl: "", publicRepoCount: 0, followers: 0, following: 0, createdAt: "", bio: null },
          summary: { repositoriesAnalyzed: 0, evidenceItems: 0, languagesDetected: [], topSkillHints: [], lastActiveDate: "" },
          repositories: [],
          evidence: [],
        },
        evaluation,
      };

      // Job description requiring Graphic Design
      const jobDescription = {
        title: "Senior Brand Designer",
        rawDescription: "Looking for Senior Brand Designer with Graphic Design skills.",
        requirements: [
          {
            skill: "Graphic Design",
            normalizedSkill: "Graphic Design",
            requirementType: "REQUIRED" as const,
          },
        ],
        extractedSkills: ["Graphic Design"],
        requiredSkills: ["Graphic Design"],
        preferredSkills: [],
      };

      const matchResult = matchJobRequirements(jobDescription, session);
      expect(matchResult.matches[0].matchStatus).toBe("VERIFIED_MATCH");

      const gapAnalysis = detectSkillGaps(matchResult);
      expect(gapAnalysis.gaps).toHaveLength(0);
      expect(gapAnalysis.verifiedRequirements[0].gapType).toBe("NONE");
    });
  });
});
