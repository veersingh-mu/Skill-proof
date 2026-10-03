/**
 * Behance Evidence Diffing Utility.
 *
 * Compares two Behance analysis runs (previous vs current)
 * to determine:
 * - NEW evidence items
 * - REMOVED evidence items
 * - UNCHANGED evidence items
 *
 * Prevents evidence duplication upon re-analysis.
 */

import type { GitHubEvidenceItem } from "@/types";

export interface EvidenceDiffSummary {
  newCount: number;
  removedCount: number;
  unchangedCount: number;
  newProjectsCount: number;
}

export interface BehanceEvidenceDiff {
  newItems: GitHubEvidenceItem[];
  removedItems: GitHubEvidenceItem[];
  unchangedItems: GitHubEvidenceItem[];
  summary: EvidenceDiffSummary;
}

/**
 * Creates a unique deterministic identity key for an evidence item.
 */
export function getEvidenceKey(item: GitHubEvidenceItem): string {
  const repoOrProject = (item.repositoryId || item.repositoryName || "").toLowerCase().trim();
  const type = item.type;
  const fact = (item.extractedFact || "").toLowerCase().trim();
  return `${repoOrProject}::${type}::${fact}`;
}

/**
 * Computes the diff between previous and current Behance evidence arrays.
 */
export function diffBehanceEvidence(
  previousEvidence: GitHubEvidenceItem[],
  currentEvidence: GitHubEvidenceItem[]
): BehanceEvidenceDiff {
  const prevMap = new Map<string, GitHubEvidenceItem>();
  for (const item of previousEvidence) {
    prevMap.set(getEvidenceKey(item), item);
  }

  const currentMap = new Map<string, GitHubEvidenceItem>();
  for (const item of currentEvidence) {
    currentMap.set(getEvidenceKey(item), item);
  }

  const newItems: GitHubEvidenceItem[] = [];
  const unchangedItems: GitHubEvidenceItem[] = [];
  const removedItems: GitHubEvidenceItem[] = [];

  const previousProjects = new Set<string>();
  for (const item of previousEvidence) {
    if (item.repositoryId) previousProjects.add(item.repositoryId);
  }

  const newProjects = new Set<string>();

  for (const [key, item] of currentMap.entries()) {
    if (prevMap.has(key)) {
      unchangedItems.push(item);
    } else {
      newItems.push(item);
      if (item.repositoryId && !previousProjects.has(item.repositoryId)) {
        newProjects.add(item.repositoryId);
      }
    }
  }

  for (const [key, item] of prevMap.entries()) {
    if (!currentMap.has(key)) {
      removedItems.push(item);
    }
  }

  return {
    newItems,
    removedItems,
    unchangedItems,
    summary: {
      newCount: newItems.length,
      removedCount: removedItems.length,
      unchangedCount: unchangedItems.length,
      newProjectsCount: newProjects.size,
    },
  };
}
