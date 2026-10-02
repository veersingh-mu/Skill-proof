export type SkillStatus = "PROVEN" | "PARTIAL" | "CLAIMED_ONLY";

export interface Skill {
  id: string;
  name: string;
  status?: SkillStatus;
}

export interface Candidate {
  id: string;
  name: string;
  githubUsername?: string;
}

export interface Resume {
  id: string;
  candidateId: string;
  fileName: string;
  uploadedAt: string;
}

export type ResumeSection = "SKILLS" | "PROJECTS" | "EXPERIENCE" | "EDUCATION" | "CERTIFICATIONS" | "OTHER";
export interface ResumeClaim { id: string; canonicalSkill: string; displayName: string; category: string; sourceSection: ResumeSection; sourceText: string; confidence: number; status: "UNVERIFIED"; }
export interface ResumeInformation { candidate: { name?: string; email?: string; phone?: string; githubUrl?: string; linkedInUrl?: string }; githubUsername?: string; claims: ResumeClaim[]; }

export interface EvidenceItem {
  id: string;
  skillId: string;
  kind: "FILE" | "COMMIT" | "DEPENDENCY" | "CONFIGURATION" | "TEST";
  label: string;
  sourceUrl: string;
}

export interface SkillAssessment {
  skill: Skill;
  status: SkillStatus;
  evidence: EvidenceItem[];
}

export interface JobRequirement {
  id: string;
  skillName: string;
  priority: "REQUIRED" | "PREFERRED";
}

export interface MicroTask {
  id: string;
  skillId: string;
  title: string;
  description: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETE";
}

export * from "./github";

