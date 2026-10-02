import type { TaskGapContext } from "./types";

const MAX_SOURCE_TEXT_CHARS = 200;

export function buildTaskGenerationPrompt(gap: TaskGapContext): string {
  const sourceContext = gap.sourceText
    ? `\nJob requirement context: "${gap.sourceText.slice(0, MAX_SOURCE_TEXT_CHARS)}"`
    : "";

  return `You are a technical task designer. Given a specific skill gap, generate exactly one practical micro-task that will produce real, verifiable technical artifacts in a public GitHub repository.

SKILL GAP DATA:
- Skill: ${gap.skill}
- Requirement type: ${gap.requirementType}
- Gap type: ${gap.gapType}
- Candidate status: ${gap.candidateStatus}
- Verification score: ${gap.verificationScore}/100
- Priority: ${gap.priority}${sourceContext}

CONSTRAINTS:
- The task must directly target: ${gap.skill}
- Do NOT claim the candidate has or lacks this skill
- Do NOT generate hiring recommendations
- Do NOT invent evidence or repositories
- Do NOT suggest learning resources -- generate a BUILD task only
- The task must produce tangible GitHub artifacts (code files, configs, README)
- Make it concrete and implementable, not generic
- Difficulty should reflect technical scope, not assumptions about the candidate
- For BEGINNER/INTERMEDIATE: practical, contained project
- For ADVANCED: requires deeper architectural decisions

Return ONLY a valid JSON object matching this exact schema -- no markdown, no explanation, just JSON:

{
  "title": "string (5-120 chars, specific and concrete)",
  "skill": "${gap.skill}",
  "objective": "string (what the candidate will build and why)",
  "scenario": "string (realistic workplace context for this task)",
  "requirements": ["array of concrete implementation requirements, min 2"],
  "steps": ["array of ordered implementation steps, min 2"],
  "deliverables": ["array of files/artifacts to produce, min 1"],
  "acceptanceCriteria": ["array of pass/fail checks, min 2"],
  "suggestedTechnologies": ["array of specific technologies needed"],
  "estimatedTime": "e.g. 2-4 hours",
  "difficulty": "BEGINNER | INTERMEDIATE | ADVANCED",
  "evidenceProduced": ["types of GitHub evidence this task creates"],
  "verificationHints": ["hints for automated verification in Phase 10"]
}`;
}

export const TASK_GENERATION_SYSTEM_INSTRUCTION =
  "You are a precise technical task designer. You generate structured, practical coding tasks from skill gap data. You output only valid JSON. You do not make claims about candidate ability. You do not generate hiring recommendations. You do not fabricate evidence.";