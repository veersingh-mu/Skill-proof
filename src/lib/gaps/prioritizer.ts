import type { RequirementType } from "@/lib/jobs/types";
import type { GapPriority, GapType } from "./types";

/**
 * Determines deterministic gap priority based on Requirement Type and Gap Type.
 *
 * Rules:
 * - HIGH: REQUIRED + NOT VERIFIED (EVIDENCE_GAP)
 * - MEDIUM: REQUIRED + PARTIAL (PARTIAL)
 * - LOW: PREFERRED + NOT VERIFIED (EVIDENCE_GAP) OR PREFERRED + PARTIAL (PARTIAL)
 */
export function determineGapPriority(
  requirementType: RequirementType,
  gapType: GapType
): GapPriority {
  if (gapType === "NONE") {
    return "LOW";
  }

  if (requirementType === "REQUIRED") {
    return gapType === "EVIDENCE_GAP" ? "HIGH" : "MEDIUM";
  }

  // PREFERRED requirements are always LOW priority gaps
  return "LOW";
}

export const PRIORITY_ORDER: Record<GapPriority, number> = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};
