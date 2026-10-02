import { z } from "zod";
export const resumeClaimSchema = z.object({ id: z.string(), canonicalSkill: z.string(), displayName: z.string(), category: z.string(), sourceSection: z.enum(["SKILLS", "PROJECTS", "EXPERIENCE", "EDUCATION", "CERTIFICATIONS", "OTHER"]), sourceText: z.string(), confidence: z.number().min(0).max(1), status: z.literal("UNVERIFIED") });
export const resumeAnalysisResponseSchema = z.object({
  candidate: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
  }),
  githubUsername: z.string().optional(),
  skills: z.array(resumeClaimSchema),
  metadata: z.object({
    filename: z.string(),
    pageCount: z.number().int().positive(),
  }),
});
export type ResumeAnalysisResponse = z.infer<typeof resumeAnalysisResponseSchema>;
