import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSampleVerificationSession } from "@/lib/evidence/sample-session";
import type { CandidateVerificationSession } from "@/lib/evidence/session";
import {
  analyzeJobDescriptionSchema,
  extractJobRequirements,
  matchJobRequirements,
} from "@/lib/jobs";

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

    const { title, description } = analyzeJobDescriptionSchema.parse(json);

    // Extract deterministic technical requirements
    const job = extractJobRequirements(description, title);

    // Determine verification session: active candidate session if provided in request, or sample fallback
    let session: CandidateVerificationSession = createSampleVerificationSession();
    if (json.session && typeof json.session === "object" && json.session.evaluation) {
      session = json.session as CandidateVerificationSession;
    }

    // Match job requirements deterministically against the candidate session
    const match = matchJobRequirements(job, session);

    return NextResponse.json({
      job,
      requirements: job.requirements,
      match,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message || "Invalid job description payload.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to analyze job description. Please try again." },
      { status: 500 }
    );
  }
}
