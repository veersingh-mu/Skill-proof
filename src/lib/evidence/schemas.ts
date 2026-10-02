import { z } from "zod";
import { githubEvidenceItemSchema, githubRepositorySchema } from "@/lib/github/schemas";

export const skillVerificationStatusSchema = z.enum(["PROVEN", "PARTIAL", "CLAIMED_ONLY"]);

export const evaluateEvidenceRequestSchema = z.object({
  claims: z.array(
    z.union([
      z.string(),
      z.object({
        id: z.string().optional(),
        canonicalSkill: z.string(),
        displayName: z.string().optional(),
        category: z.string().optional(),
      }),
    ])
  ),
  evidence: z.array(githubEvidenceItemSchema),
  repositories: z.array(githubRepositorySchema).optional().default([]),
});

export const skillVerificationResultSchema = z.object({
  skill: z.string(),
  status: skillVerificationStatusSchema,
  evidenceScore: z.number().min(0).max(100),
  reason: z.string(),
  evidenceItems: z.array(githubEvidenceItemSchema),
  repositoryCount: z.number().optional(),
  distinctSignalTypes: z.array(z.string()).optional(),
});

export const evaluateEvidenceResponseSchema = z.object({
  evaluatedAt: z.string(),
  summary: z.object({
    totalClaims: z.number(),
    provenCount: z.number(),
    partialCount: z.number(),
    claimedOnlyCount: z.number(),
    averageScore: z.number(),
  }),
  verifications: z.array(skillVerificationResultSchema),
});

export type EvaluateEvidenceRequest = z.infer<typeof evaluateEvidenceRequestSchema>;
export type EvaluateEvidenceResponse = z.infer<typeof evaluateEvidenceResponseSchema>;
