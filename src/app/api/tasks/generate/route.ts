import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateMicroTask, AIProviderError } from "@/lib/ai";
import type { TaskGapContext } from "@/lib/ai/types";

export const runtime = "nodejs";

const taskGapContextSchema = z.object({
  skill: z.string().min(1).max(80),
  requirementType: z.enum(["REQUIRED", "PREFERRED"]),
  gapType: z.enum(["NONE", "PARTIAL", "EVIDENCE_GAP"]),
  candidateStatus: z.enum(["PROVEN", "PARTIAL", "CLAIMED_ONLY", "NOT_FOUND"]),
  verificationScore: z.number().min(0).max(100),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  explanation: z.string().max(1000),
  sourceText: z.string().max(200).optional(),
});

const generateTaskRequestSchema = z.object({
  skillGap: taskGapContextSchema,
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body.", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  const parsed = generateTaskRequestSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json(
      { error: `Invalid request: ${issues}`, code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  const { skillGap } = parsed.data;

  // Business validation: verified skills cannot generate gap tasks
  if (skillGap.gapType === "NONE" || skillGap.candidateStatus === "PROVEN") {
    return NextResponse.json(
      {
        error: `Skill "${skillGap.skill}" is already verified (${skillGap.candidateStatus}). Practical tasks can only be generated for skill gaps.`,
        code: "NO_GAP",
      },
      { status: 400 }
    );
  }

  try {
    const task = await generateMicroTask(skillGap as TaskGapContext);
    return NextResponse.json({ task, gapContext: skillGap });
  } catch (err) {
    if (err instanceof AIProviderError) {
      const status =
        err.code === "MISSING_KEY"
          ? 503
          : err.code === "TIMEOUT"
          ? 504
          : err.code === "NO_GAP"
          ? 400
          : err.code === "INVALID_RESPONSE" || err.code === "VALIDATION_ERROR" || err.code === "SKILL_MISMATCH"
          ? 422
          : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred during task generation.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}