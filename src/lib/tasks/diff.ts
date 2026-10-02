import type { GitHubEvidenceItem } from "@/types";
import type { SkillVerificationResult } from "@/lib/evidence/types";
import type { EvidenceDiff } from "./types";

/**
 * Generates a stable canonical identifier for a GitHub evidence item
 * to prevent duplicate counting and allow precise diffing across evaluation runs.
 */
export function getEvidenceKey(item: GitHubEvidenceItem): string {
  const repo = (item.repositoryName || "").toLowerCase().trim();
  const type = (item.type || "").toLowerCase().trim();
  const file = (item.filePath || "").toLowerCase().trim();
  const fact = (item.extractedFact || "").toLowerCase().trim();
  return `${repo}::${type}::${file}::${fact}`;
}

/**
 * Computes a deterministic evidence diff between the previous verification state
 * and the newly evaluated state following a GitHub repository submission.
 */
export function computeEvidenceDiff(
  previousEvidence: GitHubEvidenceItem[],
  newEvidence: GitHubEvidenceItem[],
  previousVerification: SkillVerificationResult,
  newVerification: SkillVerificationResult
): EvidenceDiff {
  const previousKeyMap = new Map<string, GitHubEvidenceItem>();
  for (const item of previousEvidence) {
    previousKeyMap.set(getEvidenceKey(item), item);
  }

  const newKeyMap = new Map<string, GitHubEvidenceItem>();
  for (const item of newEvidence) {
    newKeyMap.set(getEvidenceKey(item), item);
  }

  const added: GitHubEvidenceItem[] = [];
  const unchanged: GitHubEvidenceItem[] = [];
  const removed: GitHubEvidenceItem[] = [];

  for (const [key, item] of newKeyMap.entries()) {
    if (previousKeyMap.has(key)) {
      unchanged.push(item);
    } else {
      added.push(item);
    }
  }

  for (const [key, item] of previousKeyMap.entries()) {
    if (!newKeyMap.has(key)) {
      removed.push(item);
    }
  }

  const previousScore = previousVerification.evidenceScore;
  const newScore = newVerification.evidenceScore;
  const scoreDelta = newScore - previousScore;
  const previousStatus = previousVerification.status;
  const newStatus = newVerification.status;

  const reasons: string[] = [];

  // 1. Status change explanations
  if (previousStatus !== newStatus) {
    if (newStatus === "PROVEN") {
      reasons.push(
        `Verification upgraded from ${previousStatus} to PROVEN: newly detected technical signals increased the deterministic score to ${newScore} and satisfied the multi-signal Phase 4 threshold.`
      );
    } else if (newStatus === "PARTIAL") {
      reasons.push(
        `Verification upgraded from CLAIMED_ONLY to PARTIAL: first-hand implementation evidence was detected in the submitted repository, providing verifiable technical proof.`
      );
    }
  } else {
    if (scoreDelta > 0) {
      reasons.push(
        `Evidence score increased by +${scoreDelta} points (${previousScore} → ${newScore}), but the overall status remains ${newStatus}. Additional distinct signal types are required for the next threshold.`
      );
    } else if (added.length > 0) {
      reasons.push(
        `New repository evidence was detected, but existing signals had already contributed equivalent score weighting for ${newVerification.skill}.`
      );
    } else {
      reasons.push(
        `No new technical signals for ${newVerification.skill} were identified in the submitted repository.`
      );
    }
  }

  // 2. Breakdown of new signals if any were added
  if (added.length > 0) {
    const newTypes = Array.from(new Set(added.map((a) => a.type.replace(/_/g, " "))));
    reasons.push(
      `Discovered ${added.length} new evidence ${added.length === 1 ? "item" : "items"} across signal ${added.length === 1 ? "type" : "types"}: ${newTypes.join(", ")}.`
    );
  }

  return {
    added,
    unchanged,
    removed,
    previousScore,
    newScore,
    scoreDelta,
    previousStatus,
    newStatus,
    reasons,
  };
}
