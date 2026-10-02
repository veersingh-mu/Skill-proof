import { findSkillMentions } from "@/lib/resume/normalize";
import type { ResumeClaim, ResumeInformation, ResumeSection } from "@/types";

const SECTION_HEADINGS: Record<string, ResumeSection> = {
  skills: "SKILLS",
  "technical skills": "SKILLS",
  "core competencies": "SKILLS",
  "programming languages": "SKILLS",
  projects: "PROJECTS",
  "technical projects": "PROJECTS",
  "personal projects": "PROJECTS",
  experience: "EXPERIENCE",
  "work experience": "EXPERIENCE",
  "professional experience": "EXPERIENCE",
  education: "EDUCATION",
  certifications: "CERTIFICATIONS",
};

const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;
const PHONE = /(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{2,4}\)?[ .-]?)?\d{3,4}[ .-]\d{4}\b/;
const GITHUB_URL = /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i;
const GITHUB_LABEL = /(?:github(?:\s+profile)?\s*[:\-–]\s*@?)([A-Za-z0-9_-]+)/i;
const LINKEDIN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s/]+/i;

function cleanHeader(line: string): string {
  return line
    .trim()
    .toLowerCase()
    .replace(/^#+\s*/, "")
    .replace(/[:\-–—]+$/, "")
    .trim();
}

function sectionFor(lines: string[], index: number): ResumeSection {
  for (let cursor = index; cursor >= 0; cursor -= 1) {
    const header = cleanHeader(lines[cursor]);
    const section = SECTION_HEADINGS[header];
    if (section) return section;
  }
  return "OTHER";
}

function candidateName(lines: string[]) {
  return lines.find((line) => {
    const trimmed = line.trim();
    if (
      /^(technical skills|skills|work experience|experience|projects|education|certifications|curriculum vitae|resume|profile)$/i.test(
        trimmed
      )
    ) {
      return false;
    }
    if (EMAIL.test(trimmed) || GITHUB_URL.test(trimmed) || LINKEDIN.test(trimmed) || PHONE.test(trimmed)) {
      return false;
    }
    return /^[A-Za-z'’.-]+(?:\s+[A-Za-z'’.-]+){1,3}$/.test(trimmed) && trimmed.length <= 40;
  })?.trim();
}

function cleanLineForSkillMatching(line: string): string {
  return line
    .replace(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s)]+/gi, " ")
    .replace(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)]+/gi, " ")
    .replace(EMAIL, " ");
}

export function extractResumeInformation(text: string): ResumeInformation {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const claims = new Map<string, ResumeClaim>();

  lines.forEach((line, lineIndex) => {
    const currentSection = sectionFor(lines, lineIndex);
    const lineForSkills = cleanLineForSkillMatching(line);
    for (const mention of findSkillMentions(lineForSkills)) {
      const canonical = mention.skill.canonicalName;
      if (!claims.has(canonical)) {
        claims.set(canonical, {
          id: crypto.randomUUID(),
          canonicalSkill: canonical,
          displayName: canonical,
          category: mention.skill.category,
          sourceSection: currentSection,
          sourceText: line.slice(0, 280),
          confidence:
            currentSection === "SKILLS"
              ? 0.98
              : currentSection === "PROJECTS" || currentSection === "EXPERIENCE"
                ? 0.9
                : 0.82,
          status: "UNVERIFIED",
        });
      } else {
        const existing = claims.get(canonical)!;
        if (existing.sourceSection === "OTHER" && currentSection !== "OTHER") {
          existing.sourceSection = currentSection;
          existing.sourceText = line.slice(0, 280);
          existing.confidence = currentSection === "SKILLS" ? 0.98 : 0.9;
        }
      }
    }
  });

  const githubUrlMatch = text.match(GITHUB_URL);
  const githubLabelMatch = text.match(GITHUB_LABEL);
  const githubUsername = githubUrlMatch?.[1] ?? githubLabelMatch?.[1];
  const githubUrl = githubUrlMatch?.[0] ?? (githubUsername ? `https://github.com/${githubUsername}` : undefined);

  return {
    candidate: {
      name: candidateName(lines),
      email: text.match(EMAIL)?.[0],
      phone: text.match(PHONE)?.[0],
      githubUrl,
      linkedInUrl: text.match(LINKEDIN)?.[0],
    },
    githubUsername,
    claims: [...claims.values()],
  };
}

