/**
 * POST /api/behance/analyze
 *
 * Server-side API route that analyzes a Behance profile for creative evidence.
 * Follows the same pattern as /api/github/analyze.
 *
 * Request body: { profileUrl: string }
 * Response: BehanceAnalysisResult
 */

import { NextResponse } from "next/server";
import { analyzeBehanceUser, BehanceProviderError } from "@/lib/behance";
import { parseBehanceProfileUrl, BehanceUrlError } from "@/lib/behance/parse-url";
import { behanceAnalyzeRequestSchema } from "@/lib/behance/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = behanceAnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid request body.";
      return NextResponse.json(
        { error: firstError, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Parse and validate the Behance URL
    let profileData;
    try {
      profileData = parseBehanceProfileUrl(parsed.data.profileUrl);
    } catch (urlError) {
      if (urlError instanceof BehanceUrlError) {
        return NextResponse.json(
          { error: urlError.message, code: "INVALID_BEHANCE_URL" },
          { status: 400 }
        );
      }
      throw urlError;
    }

    // Run Behance analysis
    const result = await analyzeBehanceUser({
      username: profileData.username,
      candidateId: parsed.data.candidateId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BehanceProviderError) {
      const statusMap: Record<string, number> = {
        BEHANCE_PROFILE_NOT_FOUND: 404,
        BEHANCE_ACCESS_UNAVAILABLE: 503,
        NO_PUBLIC_PROJECTS: 404,
        RATE_LIMITED: 429,
        TIMEOUT: 504,
      };
      const status = statusMap[error.code] ?? 500;

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status }
      );
    }

    console.error("[Behance Analysis Error]", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred during Behance analysis. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
