import { z } from "zod";

export const MAX_JD_LENGTH = 50000;
export const MIN_JD_LENGTH = 10;

export const analyzeJobDescriptionSchema = z.object({
  title: z
    .string()
    .max(120, "Job title must not exceed 120 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
  description: z
    .string()
    .min(1, "Job description cannot be empty")
    .transform((val) => val.trim())
    .refine((val) => val.length >= MIN_JD_LENGTH, {
      message: `Job description must be at least ${MIN_JD_LENGTH} characters.`,
    })
    .refine((val) => val.length <= MAX_JD_LENGTH, {
      message: `Job description cannot exceed ${MAX_JD_LENGTH.toLocaleString()} characters.`,
    }),
});

export type AnalyzeJobDescriptionInput = z.infer<typeof analyzeJobDescriptionSchema>;
