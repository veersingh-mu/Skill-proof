/**
 * Zod schemas for Behance provider data validation.
 */

import { z } from "zod";

export const behanceProfileSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().nullable(),
  profileUrl: z.string().url(),
  projectCount: z.number().int().nonnegative(),
});

export const behanceProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().nullable(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  publishedAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
  mediaCount: z.number().int().nonnegative(),
  coverImageUrl: z.string().nullable(),
});

export const behanceAnalyzeRequestSchema = z.object({
  profileUrl: z
    .string()
    .min(1, "Behance profile URL is required.")
    .max(300, "URL is too long."),
  candidateId: z.string().optional(),
});

export const behanceAnalyzeResponseSchema = z.object({
  analysisRunId: z.string(),
  profile: behanceProfileSchema,
  projects: z.array(behanceProjectSchema),
  evidence: z.array(z.object({
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
    provider: z.enum(["github", "behance"]).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })),
  summary: z.object({
    projectsDiscovered: z.number().int().nonnegative(),
    projectsAnalyzed: z.number().int().nonnegative(),
    evidenceItems: z.number().int().nonnegative(),
    skillHintsDetected: z.array(z.string()),
  }),
});

export type BehanceAnalyzeRequest = z.infer<typeof behanceAnalyzeRequestSchema>;
export type BehanceAnalyzeResponse = z.infer<typeof behanceAnalyzeResponseSchema>;
