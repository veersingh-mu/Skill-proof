import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { microTaskSchema } from "./schemas";
import { buildTaskGenerationPrompt, TASK_GENERATION_SYSTEM_INSTRUCTION } from "./prompt";
import type { MicroTask, TaskGapContext } from "./types";
import { randomUUID } from "crypto";
import { ZodError } from "zod";

const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const GENERATION_TIMEOUT_MS = 30_000;

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "MISSING_KEY"
      | "PROVIDER_ERROR"
      | "TIMEOUT"
      | "INVALID_RESPONSE"
      | "VALIDATION_ERROR"
      | "SKILL_MISMATCH"
      | "NO_GAP"
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export async function generateMicroTask(gap: TaskGapContext): Promise<MicroTask> {
  if (gap.gapType === "NONE" || gap.candidateStatus === "PROVEN") {
    throw new AIProviderError(
      `Skill "${gap.skill}" is already verified (${gap.candidateStatus}). Practical tasks can only be generated for skill gaps.`,
      "NO_GAP"
    );
  }

  if (!env.AI_API_KEY) {
    throw new AIProviderError(
      "AI task generation is not configured. Please add AI_API_KEY to your .env.local file.",
      "MISSING_KEY"
    );
  }

  const model = env.AI_MODEL ?? DEFAULT_MODEL;
  const client = new GoogleGenerativeAI(env.AI_API_KEY);
  const genModel = client.getGenerativeModel({
    model,
    systemInstruction: TASK_GENERATION_SYSTEM_INSTRUCTION,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
  });

  const prompt = buildTaskGenerationPrompt(gap);

  const maxAttempts = 3;
  let rawText = "";
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const generatePromise = genModel.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new AIProviderError("AI generation timed out.", "TIMEOUT")),
          GENERATION_TIMEOUT_MS
        )
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      rawText = result.response.text().trim();
      if (rawText) break;
    } catch (err) {
      lastError = err;
      if (err instanceof AIProviderError && err.code === "TIMEOUT") throw err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1200 * attempt));
        continue;
      }
    }
  }

  if (!rawText && lastError) {
    if (lastError instanceof AIProviderError) throw lastError;
    const msg = lastError instanceof Error ? lastError.message : "Unknown provider error";
    throw new AIProviderError(`AI provider error: ${msg}`, "PROVIDER_ERROR");
  }

  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AIProviderError("AI returned malformed JSON. Please try again.", "INVALID_RESPONSE");
  }

  let validated: ReturnType<typeof microTaskSchema.parse>;
  try {
    validated = microTaskSchema.parse(parsed);
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new AIProviderError(
        `AI response failed schema validation: ${issues}`,
        "VALIDATION_ERROR"
      );
    }
    throw new AIProviderError("AI response validation failed.", "VALIDATION_ERROR");
  }

  const normalizedResponseSkill = validated.skill.toLowerCase().trim();
  const normalizedRequestSkill = gap.skill.toLowerCase().trim();
  if (normalizedResponseSkill !== normalizedRequestSkill) {
    throw new AIProviderError(
      `AI generated a task for "${validated.skill}" but the requested skill was "${gap.skill}".`,
      "SKILL_MISMATCH"
    );
  }

  return { ...validated, id: randomUUID(), generatedAt: new Date().toISOString() };
}