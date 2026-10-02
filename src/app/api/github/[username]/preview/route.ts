import { type NextRequest, NextResponse } from "next/server";
import { GitHubClient, GitHubRateLimitError, GitHubUserNotFoundError } from "@/lib/github/client";
import { githubPreviewResponseSchema } from "@/lib/github/schemas";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    if (!username || !/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(username)) {
      return NextResponse.json({ error: "Invalid GitHub username format." }, { status: 400 });
    }

    const client = new GitHubClient();
    const profile = await client.getProfile(username);
    const allRepos = await client.getRepositories(username);
    const repositories = allRepos.slice(0, 10);

    const payload = githubPreviewResponseSchema.parse({
      profile,
      repositories,
    });

    return NextResponse.json(payload);
  } catch (error) {
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
      { error: "Unable to retrieve GitHub preview. Please try again later." },
      { status: 500 }
    );
  }
}
