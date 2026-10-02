import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { GitHubClient, GitHubRateLimitError, GitHubUserNotFoundError } from "@/lib/github/client";
import { analyzeGitHubUser } from "@/lib/github/analyzer";
import {
  githubAnalyzeRequestSchema,
  githubAnalyzeResponseSchema,
} from "@/lib/github/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const { username, candidateId } = githubAnalyzeRequestSchema.parse(json);
    const client = new GitHubClient();
    const result = await analyzeGitHubUser(username, client, candidateId);

    const payload = githubAnalyzeResponseSchema.parse(result);
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid request payload.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }
    if (error instanceof GitHubUserNotFoundError) {
      return NextResponse.json({ error: error.message, code: "NOT_FOUND" }, { status: 404 });
    }
    if (error instanceof GitHubRateLimitError) {
      return NextResponse.json(
        { error: "GitHub API rate limit reached. Please try again later.", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Unable to complete GitHub analysis. Please try again later." },
      { status: 500 }
    );
  }
}
