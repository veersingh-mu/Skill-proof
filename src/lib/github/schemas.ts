import { z } from "zod";

export const githubAnalyzeRequestSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required.")
    .max(39, "GitHub usernames must be 39 characters or fewer.")
    .regex(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/, "Invalid GitHub username format."),
  candidateId: z.string().optional(),
});

export const githubProfileSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
  profileUrl: z.string().url(),
  avatarUrl: z.string().url(),
  publicRepoCount: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  createdAt: z.string(),
  bio: z.string().nullable(),
});

export const githubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  fullName: z.string(),
  htmlUrl: z.string().url(),
  description: z.string().nullable(),
  isPrivate: z.boolean(),
  isFork: z.boolean(),
  isArchived: z.boolean(),
  defaultBranch: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pushedAt: z.string(),
  stargazersCount: z.number().int().nonnegative(),
  forksCount: z.number().int().nonnegative(),
  language: z.string().nullable(),
  topics: z.array(z.string()),
});

export const githubEvidenceItemSchema = z.object({
  id: z.string(),
  candidateId: z.string().optional(),
  repositoryId: z.string().optional(),
  repositoryName: z.string().optional(),
  type: z.string(),
  skillHints: z.array(z.string()),
  filePath: z.string().optional(),
  commitSha: z.string().optional(),
  sourceUrl: z.string().url(),
  extractedFact: z.string(),
  collectedAt: z.string(),
  analyzerVersion: z.string(),
});

export const githubAnalyzeResponseSchema = z.object({
  analysisRunId: z.string(),
  profile: githubProfileSchema,
  repositories: z.array(githubRepositorySchema),
  evidence: z.array(githubEvidenceItemSchema),
  summary: z.object({
    repositoriesAnalyzed: z.number().int().nonnegative(),
    evidenceItems: z.number().int().nonnegative(),
    languagesDetected: z.array(z.string()),
    topSkillHints: z.array(z.string()),
    lastActiveDate: z.string().optional(),
  }),
});

export const githubPreviewResponseSchema = z.object({
  profile: githubProfileSchema,
  repositories: z.array(githubRepositorySchema),
});

export type GitHubAnalyzeRequest = z.infer<typeof githubAnalyzeRequestSchema>;
export type GitHubAnalyzeResponse = z.infer<typeof githubAnalyzeResponseSchema>;
export type GitHubPreviewResponse = z.infer<typeof githubPreviewResponseSchema>;
