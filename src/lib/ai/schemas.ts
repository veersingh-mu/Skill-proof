import { z } from "zod";

export const microTaskDifficultySchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export const microTaskSchema = z.object({
  title: z.string().min(5).max(120),
  skill: z.string().min(1).max(80),
  objective: z.string().min(20).max(600),
  scenario: z.string().min(20).max(800),
  requirements: z.array(z.string().min(5)).min(2).max(10),
  steps: z.array(z.string().min(5)).min(2).max(12),
  deliverables: z.array(z.string().min(3)).min(1).max(8),
  acceptanceCriteria: z.array(z.string().min(5)).min(2).max(8),
  suggestedTechnologies: z.array(z.string().min(1)).max(8),
  estimatedTime: z.string().min(3).max(30),
  difficulty: microTaskDifficultySchema,
  evidenceProduced: z.array(z.string().min(3)).min(1).max(8),
  verificationHints: z.array(z.string().min(5)).max(6),
});

export type MicroTaskSchemaInput = z.infer<typeof microTaskSchema>;