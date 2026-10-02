import { findSkillMentions } from "@/lib/resume/normalize";
import type { JobDescriptionAnalysis, JobRequirement, RequirementType } from "./types";

interface SectionRule {
  type: RequirementType | "GENERAL";
  pattern: RegExp;
}

const SECTION_RULES: SectionRule[] = [
  // Preferred sections (check first because phrases like "preferred qualifications" contain "qualifications")
  {
    type: "PREFERRED",
    pattern:
      /^(?:#+\s*)?(?:preferred(?:\s+skills|\s+qualifications|\s+experience|\s+technologies)?|nice(?:\s*-\s*|\s+)to(?:\s*-\s*|\s+)have|good(?:\s*-\s*|\s+)to(?:\s*-\s*|\s+)have|bonus(?:\s+points)?|optional|pluses?|plus|what\s+would\s+be\s+nice|desired(?:\s+skills|\s+qualifications)?)[\s:\-–—]*$/i,
  },
  // Required sections
  {
    type: "REQUIRED",
    pattern:
      /^(?:#+\s*)?(?:core\s+|technical\s+|minimum\s+|basic\s+)?(?:required(?:\s+skills|\s+qualifications|\s+experience|\s+technologies)?|requirements|must(?:\s*-\s*|\s+)have|essential(?:\s+skills|\s+qualifications)?|mandatory|what\s+you(?:'ll|\s+will)?\s+need|what\s+we(?:'re|\s+are)?\s+looking\s+for|qualifications)[\s:\-–—]*$/i,
  },
  // General / Non-technical or terminating sections
  {
    type: "GENERAL",
    pattern:
      /^(?:#+\s*)?(?:responsibilities|duties|what\s+you(?:'ll|\s+will)?\s+do|about(?:\s+the)?\s+(?:role|job|company|us)|job\s+summary|overview|benefits|perks|compensation|equal\s+opportunity)[\s:\-–—]*$/i,
  },
];

const INLINE_PREFIX_RULES: Array<{ type: RequirementType; pattern: RegExp }> = [
  {
    type: "PREFERRED",
    pattern:
      /^(?:preferred|nice(?:\s*-\s*|\s+)to(?:\s*-\s*|\s+)have|good(?:\s*-\s*|\s+)to(?:\s*-\s*|\s+)have|bonus|optional|plus)[\s:\-–—]+/i,
  },
  {
    type: "REQUIRED",
    pattern:
      /^(?:required|must(?:\s*-\s*|\s+)have|essential|mandatory|minimum(?:\s+requirements)?)[\s:\-–—]+/i,
  },
];

const LIST_BULLET_REGEX = /^[-*•\d+.)]\s+/;

const PROSE_RESUME_REGEX =
  /^(?:the\s+candidate\s+should|we\s+are\s+looking\s+for|we\s+offer|in\s+this\s+role|you\s+will|you\s+should|our\s+team)/i;

/**
 * Checks if the entire text contains explicit section headers for required/preferred skills.
 */
function hasExplicitRequirementHeaders(lines: string[]): boolean {
  return lines.some((line) => {
    const trimmed = line.trim();
    return SECTION_RULES.some(
      (rule) => rule.type !== "GENERAL" && rule.pattern.test(trimmed)
    );
  });
}

/**
 * Deterministically extracts technical skill requirements from a Job Description.
 */
export function extractJobRequirements(
  description: string,
  title?: string
): JobDescriptionAnalysis {
  const rawLines = description.split(/\r?\n/);
  const lines = rawLines.map((l) => l.trim()).filter(Boolean);
  const explicitSectionsExist = hasExplicitRequirementHeaders(lines);

  // Map canonical skill name to requirement object
  const requirementMap = new Map<string, JobRequirement>();

  let activeSection: RequirementType | "GENERAL" | null = null;
  let sectionHadListBullets = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      continue;
    }

    // 1. Check if line is a section heading
    const matchedSection: SectionRule | undefined = SECTION_RULES.find((rule) =>
      rule.pattern.test(line)
    );

    if (matchedSection) {
      activeSection = matchedSection.type;
      sectionHadListBullets = false;
      continue;
    }

    // 2. Check for inline section prefix (e.g. "Required Skills: React, Node.js")
    let lineRequirementType: RequirementType | null = null;
    let contentToAnalyze = line;

    for (const prefixRule of INLINE_PREFIX_RULES) {
      if (prefixRule.pattern.test(line)) {
        lineRequirementType = prefixRule.type;
        contentToAnalyze = line.replace(prefixRule.pattern, "").trim();
        break;
      }
    }

    const isListBullet = LIST_BULLET_REGEX.test(line);
    if (isListBullet) {
      sectionHadListBullets = true;
    }

    // If explicit sections exist, narrative paragraphs that follow a bulleted list exit the skills section
    if (
      explicitSectionsExist &&
      activeSection !== null &&
      activeSection !== "GENERAL" &&
      sectionHadListBullets &&
      !isListBullet &&
      PROSE_RESUME_REGEX.test(line)
    ) {
      activeSection = "GENERAL";
    }

    // Determine the effective requirement type for this line
    let effectiveType: RequirementType | null = null;

    if (lineRequirementType) {
      effectiveType = lineRequirementType;
    } else if (activeSection === "REQUIRED" || activeSection === "PREFERRED") {
      effectiveType = activeSection;
    } else if (!explicitSectionsExist) {
      // Deterministic contextual rule if no explicit sections exist in the document:
      if (
        /\b(?:preferred|nice(?:\s*-\s*|\s+)to(?:\s*-\s*|\s+)have|good(?:\s*-\s*|\s+)to(?:\s*-\s*|\s+)have|bonus|optional|plus)\b/i.test(
          line
        )
      ) {
        effectiveType = "PREFERRED";
      } else {
        effectiveType = "REQUIRED";
      }
    }

    // If outside any requirement section in an explicitly-structured JD, skip skill extraction
    if (!effectiveType) {
      continue;
    }

    // Find all technical skills mentioned in this line
    const mentions = findSkillMentions(contentToAnalyze);
    for (const mention of mentions) {
      const canonical = mention.skill.canonicalName;
      const existing = requirementMap.get(canonical);

      if (!existing) {
        requirementMap.set(canonical, {
          skill: canonical,
          normalizedSkill: canonical,
          requirementType: effectiveType,
          category: mention.skill.category,
          sourceText: line.slice(0, 200),
          matchedTerm: mention.match,
        });
      } else {
        // Precedence: If already recorded as PREFERRED, but now encountered as REQUIRED, upgrade it!
        if (existing.requirementType === "PREFERRED" && effectiveType === "REQUIRED") {
          existing.requirementType = "REQUIRED";
          existing.sourceText = line.slice(0, 200);
          existing.matchedTerm = mention.match;
        }
      }
    }
  }

  const requirements = Array.from(requirementMap.values());
  const extractedSkills = requirements.map((r) => r.skill);
  const requiredSkills = requirements
    .filter((r) => r.requirementType === "REQUIRED")
    .map((r) => r.skill);
  const preferredSkills = requirements
    .filter((r) => r.requirementType === "PREFERRED")
    .map((r) => r.skill);

  return {
    title: title?.trim() || undefined,
    rawDescription: description,
    requirements,
    extractedSkills,
    requiredSkills,
    preferredSkills,
  };
}
