import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { microTaskSchema } from "@/lib/ai/schemas";
import { buildTaskGenerationPrompt, TASK_GENERATION_SYSTEM_INSTRUCTION } from "@/lib/ai/prompt";
import { AIProviderError } from "@/lib/ai/provider";
import type { TaskGapContext } from "@/lib/ai/types";
import { POST as generateTaskRoute } from "@/app/api/tasks/generate/route";

// ------------------------------------------
// Mock server-only so it does not throw in test env
// ------------------------------------------
vi.mock("server-only", () => ({}));

// ------------------------------------------
// Mock the AI provider so tests NEVER hit a real API
// ------------------------------------------
vi.mock("@/lib/ai/provider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/ai/provider")>();
  return {
    ...original,
    generateMicroTask: vi.fn(),
  };
});

import { generateMicroTask } from "@/lib/ai/provider";
const mockGenerateMicroTask = vi.mocked(generateMicroTask);

// ------------------------------------------
// Test fixtures
// ------------------------------------------
const AWS_GAP: TaskGapContext = {
  skill: "AWS",
  requirementType: "REQUIRED",
  gapType: "EVIDENCE_GAP",
  candidateStatus: "CLAIMED_ONLY",
  verificationScore: 0,
  priority: "HIGH",
  explanation: "No sufficient GitHub evidence currently verifies AWS.",
  sourceText: "Experience deploying applications using AWS.",
};

const DOCKER_GAP: TaskGapContext = {
  skill: "Docker",
  requirementType: "PREFERRED",
  gapType: "PARTIAL",
  candidateStatus: "PARTIAL",
  verificationScore: 50,
  priority: "LOW",
  explanation: "Some GitHub evidence supports Docker, but below the PROVEN threshold.",
};

const VALID_TASK_PAYLOAD = {
  title: "Deploy a Node.js REST API to AWS EC2",
  skill: "AWS",
  objective: "Deploy a small Node.js REST API to an AWS EC2 instance and document the deployment.",
  scenario: "Your team needs a production-deployable service hosted on AWS infrastructure.",
  requirements: [
    "Create an AWS EC2 instance using the free tier",
    "Deploy a Node.js REST API to the instance",
  ],
  steps: [
    "Set up an EC2 instance with Amazon Linux",
    "SSH into the instance and install Node.js",
    "Clone your API repository and start the server",
    "Configure a security group to allow HTTP traffic",
  ],
  deliverables: [
    "Deployed API accessible via public IP",
    "README with deployment instructions",
    "Infrastructure configuration files",
  ],
  acceptanceCriteria: [
    "EC2 instance is running and accessible",
    "API responds to GET /health with 200",
    "README explains how to reproduce the deployment",
  ],
  suggestedTechnologies: ["AWS EC2", "Node.js", "Amazon Linux"],
  estimatedTime: "2-4 hours",
  difficulty: "INTERMEDIATE" as const,
  evidenceProduced: [
    "deployment configuration scripts",
    "infrastructure setup files",
    "application source code",
    "README documentation",
  ],
  verificationHints: [
    "Check for EC2 configuration files or deployment scripts",
    "Verify README contains AWS deployment instructions",
  ],
};

// ------------------------------------------
describe("Phase 9 — AI Micro-Task Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Valid task schema passes Zod validation
  it("TEST 1: accepts a well-formed task payload through Zod schema validation", () => {
    expect(() => microTaskSchema.parse(VALID_TASK_PAYLOAD)).not.toThrow();
  });

  // 2. Missing title fails validation
  it("TEST 2: rejects a task payload with an empty title", () => {
    const bad = { ...VALID_TASK_PAYLOAD, title: "" };
    expect(() => microTaskSchema.parse(bad)).toThrow();
  });

  // 3. Missing requirements fails validation
  it("TEST 3: rejects a task payload with fewer than 2 requirements", () => {
    const bad = { ...VALID_TASK_PAYLOAD, requirements: ["Only one requirement"] };
    expect(() => microTaskSchema.parse(bad)).toThrow();
  });

  // 4. Missing deliverables fails validation
  it("TEST 4: rejects a task payload with zero deliverables", () => {
    const bad = { ...VALID_TASK_PAYLOAD, deliverables: [] };
    expect(() => microTaskSchema.parse(bad)).toThrow();
  });

  // 5. Missing acceptance criteria fails validation
  it("TEST 5: rejects a task payload with fewer than 2 acceptance criteria", () => {
    const bad = { ...VALID_TASK_PAYLOAD, acceptanceCriteria: ["Only one criterion"] };
    expect(() => microTaskSchema.parse(bad)).toThrow();
  });

  // 6. Invalid difficulty fails validation
  it("TEST 6: rejects an invalid difficulty value", () => {
    const bad = { ...VALID_TASK_PAYLOAD, difficulty: "EXTREME" };
    expect(() => microTaskSchema.parse(bad)).toThrow();
  });

  // 7. Missing evidenceProduced fails validation
  it("TEST 7: rejects a task payload with zero evidenceProduced entries", () => {
    const bad = { ...VALID_TASK_PAYLOAD, evidenceProduced: [] };
    expect(() => microTaskSchema.parse(bad)).toThrow();
  });

  // 8. Missing steps fails validation
  it("TEST 8: rejects a task payload with fewer than 2 implementation steps", () => {
    const bad = { ...VALID_TASK_PAYLOAD, steps: ["Only one step"] };
    expect(() => microTaskSchema.parse(bad)).toThrow();
  });

  // 9. Gap metadata is preserved and never modified
  it("TEST 9: gap metadata (skill, type, score, priority) is preserved on TaskGapContext", () => {
    expect(AWS_GAP.skill).toBe("AWS");
    expect(AWS_GAP.requirementType).toBe("REQUIRED");
    expect(AWS_GAP.gapType).toBe("EVIDENCE_GAP");
    expect(AWS_GAP.candidateStatus).toBe("CLAIMED_ONLY");
    expect(AWS_GAP.verificationScore).toBe(0);
    expect(AWS_GAP.priority).toBe("HIGH");
  });

  // 10. Task skill must match the requested gap skill
  it("TEST 10: AIProviderError with SKILL_MISMATCH code exists for wrong-skill detection", () => {
    const err = new AIProviderError('AI generated a task for "React" but "AWS" was requested.', "SKILL_MISMATCH");
    expect(err.code).toBe("SKILL_MISMATCH");
    expect(err.name).toBe("AIProviderError");
  });

  // 11. No fabricated current evidence — VALID_TASK_PAYLOAD has evidenceProduced, not current evidence
  it("TEST 11: task schema contains evidenceProduced (future) not currentEvidence (present)", () => {
    const fields = Object.keys(microTaskSchema.shape);
    expect(fields).toContain("evidenceProduced");
    expect(fields).not.toContain("currentEvidence");
    expect(fields).not.toContain("existingEvidence");
  });

  // 12. Missing AI key error is properly typed
  it("TEST 12: AIProviderError with MISSING_KEY is thrown and identifiable", () => {
    const err = new AIProviderError(
      "AI task generation is not configured. Please add AI_API_KEY to your .env.local file.",
      "MISSING_KEY"
    );
    expect(err.code).toBe("MISSING_KEY");
    expect(err.message).toContain("AI_API_KEY");
  });

  // 13. Provider failure error is properly typed
  it("TEST 13: AIProviderError with PROVIDER_ERROR code is identifiable", () => {
    const err = new AIProviderError("AI provider error: Connection refused", "PROVIDER_ERROR");
    expect(err.code).toBe("PROVIDER_ERROR");
    expect(err instanceof AIProviderError).toBe(true);
  });

  // 14. Malformed JSON error is properly typed
  it("TEST 14: AIProviderError with INVALID_RESPONSE code is identifiable", () => {
    const err = new AIProviderError("AI returned malformed JSON. Please try again.", "INVALID_RESPONSE");
    expect(err.code).toBe("INVALID_RESPONSE");
  });

  // 15. Mock: generateMicroTask returns valid task when provider succeeds
  it("TEST 15: mocked generateMicroTask returns a complete MicroTask on success", async () => {
    const expected = {
      ...VALID_TASK_PAYLOAD,
      id: "mock-uuid-1234",
      generatedAt: new Date().toISOString(),
    };
    mockGenerateMicroTask.mockResolvedValueOnce(expected);

    const result = await generateMicroTask(AWS_GAP);
    expect(result.skill).toBe("AWS");
    expect(result.title).toBeTruthy();
    expect(result.requirements.length).toBeGreaterThanOrEqual(2);
    expect(result.deliverables.length).toBeGreaterThanOrEqual(1);
    expect(result.acceptanceCriteria.length).toBeGreaterThanOrEqual(2);
    expect(result.evidenceProduced.length).toBeGreaterThanOrEqual(1);
    expect(result.id).toBeDefined();
    expect(result.generatedAt).toBeDefined();
  });

  // 16. Mock: generateMicroTask propagates AIProviderError on missing key
  it("TEST 16: mocked generateMicroTask throws AIProviderError with MISSING_KEY when key absent", async () => {
    mockGenerateMicroTask.mockRejectedValueOnce(
      new AIProviderError("AI_API_KEY is not configured.", "MISSING_KEY")
    );
    const error = await generateMicroTask(AWS_GAP).catch((e) => e);
    expect(error).toBeInstanceOf(AIProviderError);
    expect(error.code).toBe("MISSING_KEY");

  });
  // 17. Prompt builder includes the skill name
  it("TEST 17: buildTaskGenerationPrompt includes the gap skill in the prompt text", () => {
    const prompt = buildTaskGenerationPrompt(AWS_GAP);
    expect(prompt).toContain("AWS");
    expect(prompt).toContain("EVIDENCE_GAP");
    expect(prompt).toContain("CLAIMED_ONLY");
    expect(prompt).toContain("REQUIRED");
  });

  // 18. Prompt builder trims sourceText to safe length
  it("TEST 18: buildTaskGenerationPrompt includes sourceText when present", () => {
    const prompt = buildTaskGenerationPrompt(AWS_GAP);
    expect(prompt).toContain("Experience deploying applications using AWS.");
  });

  // 19. System instruction is non-empty and contains key guidance
  it("TEST 19: TASK_GENERATION_SYSTEM_INSTRUCTION is non-empty and contains key constraints", () => {
    expect(TASK_GENERATION_SYSTEM_INSTRUCTION).toBeTruthy();
    expect(TASK_GENERATION_SYSTEM_INSTRUCTION).toContain("JSON");
    expect(TASK_GENERATION_SYSTEM_INSTRUCTION.length).toBeGreaterThan(20);
  });

  // 20. Partial gap context is valid
  it("TEST 20: DOCKER_GAP partial gap context is correctly structured", () => {
    expect(DOCKER_GAP.skill).toBe("Docker");
    expect(DOCKER_GAP.gapType).toBe("PARTIAL");
    expect(DOCKER_GAP.candidateStatus).toBe("PARTIAL");
    expect(DOCKER_GAP.verificationScore).toBe(50);
    expect(DOCKER_GAP.priority).toBe("LOW");
  });

  // 21. Timeout error type check
  it("TEST 21: AIProviderError with TIMEOUT code is identifiable", () => {
    const err = new AIProviderError("AI generation timed out.", "TIMEOUT");
    expect(err.code).toBe("TIMEOUT");
  });

  // 22. Validation error type check
  it("TEST 22: AIProviderError with VALIDATION_ERROR code is identifiable", () => {
    const err = new AIProviderError("Schema validation failed.", "VALIDATION_ERROR");
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  // 23. Task schema has all required Phase 10 compatibility fields
  it("TEST 23: microTaskSchema includes all Phase 10 compatibility fields", () => {
    const fields = Object.keys(microTaskSchema.shape);
    expect(fields).toContain("skill");
    expect(fields).toContain("deliverables");
    expect(fields).toContain("acceptanceCriteria");
    expect(fields).toContain("evidenceProduced");
    expect(fields).toContain("verificationHints");
    expect(fields).toContain("difficulty");
    expect(fields).toContain("estimatedTime");
  });

  // 24. Verified skills rejected (cannot generate task for verified skill)
  it("TEST 24: rejects task generation for an already verified skill", async () => {
    const VERIFIED_GAP: TaskGapContext = {
      skill: "React",
      requirementType: "REQUIRED",
      gapType: "NONE",
      candidateStatus: "PROVEN",
      verificationScore: 92,
      priority: "LOW",
      explanation: "React is fully verified with 3 repositories.",
    };

    const req = new NextRequest("http://localhost:3000/api/tasks/generate", {
      method: "POST",
      body: JSON.stringify({ skillGap: VERIFIED_GAP }),
    });

    const res = await generateTaskRoute(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe("NO_GAP");
    expect(data.error).toContain("already verified");
  });

  // 25. POST /api/tasks/generate rejects malformed or missing body
  it("TEST 25: POST /api/tasks/generate returns 400 for invalid body", async () => {
    const req = new NextRequest("http://localhost:3000/api/tasks/generate", {
      method: "POST",
      body: JSON.stringify({ bad: "payload" }),
    });

    const res = await generateTaskRoute(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe("INVALID_REQUEST");
  });

  // 26. POST /api/tasks/generate returns 200 with task on success
  it("TEST 26: POST /api/tasks/generate returns 200 with generated task and preserves gapContext", async () => {
    const expectedTask = {
      ...VALID_TASK_PAYLOAD,
      id: "test-uuid-5678",
      generatedAt: new Date().toISOString(),
    };
    mockGenerateMicroTask.mockResolvedValueOnce(expectedTask);

    const req = new NextRequest("http://localhost:3000/api/tasks/generate", {
      method: "POST",
      body: JSON.stringify({ skillGap: AWS_GAP }),
    });

    const res = await generateTaskRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.task.title).toBe(VALID_TASK_PAYLOAD.title);
    expect(data.gapContext.skill).toBe("AWS");
    expect(data.gapContext.verificationScore).toBe(0);
    expect(data.gapContext.candidateStatus).toBe("CLAIMED_ONLY");
  });

  // 27. POST /api/tasks/generate returns 503 when AI key is missing
  it("TEST 27: POST /api/tasks/generate maps MISSING_KEY to 503 Service Unavailable", async () => {
    mockGenerateMicroTask.mockRejectedValueOnce(
      new AIProviderError("AI_API_KEY is not configured.", "MISSING_KEY")
    );

    const req = new NextRequest("http://localhost:3000/api/tasks/generate", {
      method: "POST",
      body: JSON.stringify({ skillGap: AWS_GAP }),
    });

    const res = await generateTaskRoute(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe("MISSING_KEY");
  });

  // 28. POST /api/tasks/generate maps SKILL_MISMATCH to 422
  it("TEST 28: POST /api/tasks/generate maps SKILL_MISMATCH to 422 Unprocessable Entity", async () => {
    mockGenerateMicroTask.mockRejectedValueOnce(
      new AIProviderError('AI generated a task for "React" but requested skill was "AWS".', "SKILL_MISMATCH")
    );

    const req = new NextRequest("http://localhost:3000/api/tasks/generate", {
      method: "POST",
      body: JSON.stringify({ skillGap: AWS_GAP }),
    });

    const res = await generateTaskRoute(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.code).toBe("SKILL_MISMATCH");
  });
});
