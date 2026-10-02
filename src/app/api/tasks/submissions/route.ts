import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reverifyTaskSubmission } from "@/lib/tasks/reverify";
import { GitHubUrlError } from "@/lib/github/parse-url";
import { GitHubApiError, GitHubRateLimitError } from "@/lib/github/client";
import type { GitHubEvidenceItem, GitHubRepository } from "@/types";
import type { SkillVerificationResult } from "@/lib/evidence/types";
import type { MicroTask } from "@/lib/ai/types";

export const runtime = "nodejs";

const submissionRequestSchema = z.object({
  taskId: z.string().min(1, "Task ID is required."),
  skill: z.string().min(1, "Target skill is required."),
  repositoryUrl: z.string().min(1, "GitHub repository URL is required."),
  task: z.any().optional(),
  existingEvidence: z.array(z.any()).optional(),
  existingRepositories: z.array(z.any()).optional(),
  previousVerification: z.any().optional(),
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

  const parsed = submissionRequestSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json(
      { error: `Validation error: ${issues}`, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const {
    taskId,
    skill,
    repositoryUrl,
    task,
    existingEvidence,
    existingRepositories,
    previousVerification,
  } = parsed.data;

  try {
    const result = await reverifyTaskSubmission({
      taskId,
      skill,
      repositoryUrl,
      task: task as MicroTask | undefined,
      existingEvidence: existingEvidence as GitHubEvidenceItem[] | undefined,
      existingRepositories: existingRepositories as GitHubRepository[] | undefined,
      previousVerification: previousVerification as SkillVerificationResult | undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GitHubUrlError) {
      return NextResponse.json(
        { error: err.message, code: "INVALID_URL" },
        { status: 400 }
      );
    }

    if (err instanceof GitHubRateLimitError) {
      return NextResponse.json(
        { error: "GitHub API rate limit reached. Please try again later.", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    if (err instanceof GitHubApiError) {
      if (err.statusCode === 404) {
        return NextResponse.json(
          { error: "GitHub repository could not be found or is private.", code: "REPO_NOT_FOUND" },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: `GitHub API error: ${err.message}`, code: err.code },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unexpected error occurred during submission analysis.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
