import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildSkillProofPortfolio } from "@/lib/portfolio/builder";
import type { CandidateVerificationSession } from "@/lib/evidence/session";
import type { TaskSubmission } from "@/lib/tasks/types";
import type { JobMatchEvaluation } from "@/lib/jobs/types";

export const runtime = "nodejs";

const portfolioRequestSchema = z.object({
  session: z.any().optional(),
  taskSubmissions: z.array(z.any()).optional(),
  jobMatch: z.any().optional(),
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

  const parsed = portfolioRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid portfolio request schema.", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const { session, taskSubmissions, jobMatch } = parsed.data;

  try {
    const portfolio = buildSkillProofPortfolio(
      session as CandidateVerificationSession | null,
      taskSubmissions as TaskSubmission[] | undefined,
      jobMatch as JobMatchEvaluation | null | undefined
    );

    return NextResponse.json({ portfolio });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to aggregate portfolio.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
