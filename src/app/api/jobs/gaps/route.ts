import { type NextRequest, NextResponse } from "next/server";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import type { CandidateVerificationSession } from "@/lib/evidence/session";
import {
  analyzeJobDescriptionSchema,
  extractJobRequirements,
  matchJobRequirements,
  type JobMatchEvaluation,
} from "@/lib/jobs";
import { detectSkillGaps } from "@/lib/gaps";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // Mode A: Direct JobMatchEvaluation passed
    if (json.matches && Array.isArray(json.matches) && json.metrics) {
      const evaluation = json as JobMatchEvaluation;
      const gaps = detectSkillGaps(evaluation);
      return NextResponse.json({ gaps });
    }

    // Mode B: Job Description payload passed
    const { title, description } = analyzeJobDescriptionSchema.parse(json);
    const job = extractJobRequirements(description, title);

    let session: CandidateVerificationSession = createSampleVerificationSession();
    if (json.session && typeof json.session === "object" && json.session.evaluation) {
      session = json.session as CandidateVerificationSession;
    }

    const match = matchJobRequirements(job, session);
    const gaps = detectSkillGaps(match);

    return NextResponse.json({
      gaps,
      match,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to detect skill gaps." },
      { status: 400 }
    );
  }
}
