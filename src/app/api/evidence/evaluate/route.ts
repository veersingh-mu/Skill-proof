import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { evaluateEvidence } from "@/lib/evidence/engine";
import type { GitHubEvidenceItem, GitHubRepository } from "@/types";
import {
  evaluateEvidenceRequestSchema,
  evaluateEvidenceResponseSchema,
} from "@/lib/evidence/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const { claims, evidence, repositories } = evaluateEvidenceRequestSchema.parse(json);

    // Map claims to the expected engine format
    const formattedClaims = claims.map((c) =>
      typeof c === "string"
        ? c
        : {
            id: c.id || crypto.randomUUID(),
            canonicalSkill: c.canonicalSkill,
            displayName: c.displayName || c.canonicalSkill,
            category: c.category || "General",
            sourceSection: "OTHER" as const,
            sourceText: "",
            confidence: 1,
            status: "UNVERIFIED" as const,
          }
    );

    const result = evaluateEvidence(
      formattedClaims,
      evidence as unknown as GitHubEvidenceItem[],
      repositories as unknown as GitHubRepository[]
    );
    const payload = evaluateEvidenceResponseSchema.parse(result);

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid request payload.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to evaluate evidence. Please try again." },
      { status: 500 }
    );
  }
}
