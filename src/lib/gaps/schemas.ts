import { z } from "zod";

export const gapTypeSchema = z.enum(["NONE", "PARTIAL", "EVIDENCE_GAP"]);
export const gapPrioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const skillGapSchema = z.object({
  skill: z.string(),
  requirementType: z.enum(["REQUIRED", "PREFERRED"]),
  gapType: gapTypeSchema,
  candidateStatus: z.enum(["PROVEN", "PARTIAL", "CLAIMED_ONLY", "NOT_FOUND"]),
  verificationScore: z.number().min(0).max(100),
  priority: gapPrioritySchema,
  evidenceCount: z.number().int().min(0),
  explanation: z.string(),
  repositoryCount: z.number().int().min(0),
  sourceText: z.string().optional(),
});

export const skillGapSummarySchema = z.object({
  totalRequired: z.number().int().min(0),
  totalPreferred: z.number().int().min(0),
  totalRequirements: z.number().int().min(0),
  verifiedCount: z.number().int().min(0),
  partialCount: z.number().int().min(0),
  evidenceGapCount: z.number().int().min(0),
  requiredEvidenceGaps: z.number().int().min(0),
  preferredEvidenceGaps: z.number().int().min(0),
  requiredPartialGaps: z.number().int().min(0),
  preferredPartialGaps: z.number().int().min(0),
  highPriorityCount: z.number().int().min(0),
  mediumPriorityCount: z.number().int().min(0),
  lowPriorityCount: z.number().int().min(0),
});
