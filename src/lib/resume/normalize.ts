import { SKILL_TAXONOMY, type TaxonomySkill } from "@/lib/resume/taxonomy";

const normalized = (value: string) => value.trim().toLocaleLowerCase();

export function normalizeSkill(value: string): TaxonomySkill | undefined {
  const candidate = normalized(value);
  return SKILL_TAXONOMY.find((skill) =>
    [skill.canonicalName, ...skill.aliases].some((name) => normalized(name) === candidate)
  );
}

export function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface SkillPattern {
  skill: TaxonomySkill;
  pattern: string;
  isCaseSensitive: boolean;
}

const COMPILED_PATTERNS: SkillPattern[] = SKILL_TAXONOMY.flatMap((skill) =>
  [skill.canonicalName, ...skill.aliases].map((name) => ({
    skill,
    pattern: name,
    isCaseSensitive: ["C", "Go", "JS", "TS", "ML", "Node"].includes(name),
  }))
).sort((a, b) => b.pattern.length - a.pattern.length);

export function findSkillMentions(text: string) {
  const mentions: Array<{ skill: TaxonomySkill; match: string; index: number }> = [];
  const matchedSpans: Array<{ start: number; end: number }> = [];

  for (const { skill, pattern, isCaseSensitive } of COMPILED_PATTERNS) {
    const flags = isCaseSensitive ? "g" : "gi";
    const regex = new RegExp(`(?<![A-Za-z0-9+#.])${escapeForRegex(pattern)}(?![A-Za-z0-9+#])`, flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      const overlaps = matchedSpans.some((span) => start < span.end && end > span.start);
      if (overlaps) {
        continue;
      }

      if (pattern === "C") {
        const after = text.slice(end);
        if (/^\.\s+[A-Z]/.test(after)) {
          continue;
        }
      }

      mentions.push({ skill, match: match[0], index: start });
      matchedSpans.push({ start, end });
      break;
    }
  }

  return mentions.sort((a, b) => a.index - b.index);
}
