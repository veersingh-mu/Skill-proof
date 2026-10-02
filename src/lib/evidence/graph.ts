import type { CandidateVerificationSession } from "./session";
import type { SkillVerificationResult } from "./types";
import type { GitHubEvidenceItem, GitHubRepository, ResumeClaim, SkillStatus } from "@/types";
import { STRONG_TECHNICAL_TYPES } from "./config";

export type EvidenceGraphNodeType =
  | "candidate"
  | "claim"
  | "skill"
  | "repository"
  | "evidence"
  | "artifact"
  | "empty_state";

export interface CandidateNodeData {
  type: "candidate";
  name: string;
  githubUsername: string;
  analyzedAt: string;
}

export interface ClaimNodeData {
  type: "claim";
  displayName: string;
  canonicalSkill: string;
  category: string;
  sourceSection?: string;
  sourceText?: string;
}

export interface SkillNodeData {
  type: "skill";
  skill: string;
  status: SkillStatus;
  evidenceScore: number;
  reason: string;
  repositoryCount: number;
  evidenceCount: number;
  distinctSignalTypes: string[];
}

export interface RepositoryNodeData {
  type: "repository";
  name: string;
  fullName: string;
  htmlUrl: string;
  description?: string | null;
  language?: string | null;
  stargazersCount?: number;
}

export interface EvidenceNodeData {
  type: "evidence";
  evidenceType: string;
  extractedFact: string;
  repositoryName: string;
  sourceUrl?: string;
  isStrongTechnical: boolean;
  filePath?: string;
}

export interface ArtifactNodeData {
  type: "artifact";
  label: string;
  filePath?: string;
  commitSha?: string;
  repositoryName: string;
  sourceUrl: string;
}

export interface EmptyStateNodeData {
  type: "empty_state";
  skill: string;
  message: string;
}

export type EvidenceNodePayload =
  | CandidateNodeData
  | ClaimNodeData
  | SkillNodeData
  | RepositoryNodeData
  | EvidenceNodeData
  | ArtifactNodeData
  | EmptyStateNodeData;

export interface GraphNode {
  id: string;
  type: EvidenceGraphNodeType;
  position: { x: number; y: number };
  data: EvidenceNodePayload;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  data?: {
    relationshipType: "claim" | "verification" | "repository" | "evidence" | "artifact" | "empty";
    isStrong: boolean;
  };
}

export interface EvidenceGraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BuildGraphOptions {
  /** Filter to a specific skill canonical name, or 'ALL' */
  selectedSkill?: string;
}

/**
 * Deterministically constructs graph nodes and edges from an active verification session.
 * Does NOT generate new verification logic; visualizes existing Phase 3/4 data only.
 */
export function buildEvidenceGraph(
  session: CandidateVerificationSession | null | undefined,
  options: BuildGraphOptions = {}
): EvidenceGraphModel {
  if (!session) {
    return { nodes: [], edges: [] };
  }

  const { candidate, githubUsername, analyzedAt, claims, githubResult, evaluation } = session;
  const { selectedSkill = "ALL" } = options;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Lookup maps for deduplication and stability
  const nodeMap = new Map<string, GraphNode>();
  const edgeSet = new Set<string>();

  function addNode(node: GraphNode) {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
      nodes.push(node);
    }
  }

  function addEdge(edge: GraphEdge) {
    const key = `${edge.source}-->${edge.target}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push(edge);
    }
  }

  // Helper for stable IDs
  const candidateId = `candidate:${githubUsername || "candidate"}`;
  const getClaimId = (skillName: string) => `claim:${skillName.toLowerCase().trim()}`;
  const getSkillId = (skillName: string) => `skill:${skillName.toLowerCase().trim()}`;
  const getRepoId = (repoName: string) => `repo:${repoName.toLowerCase().trim()}`;
  const getEvidenceId = (repoName: string, type: string, indexOrFact: string) =>
    `evidence:${repoName.toLowerCase()}:${type}:${indexOrFact.slice(0, 32).replace(/[^a-zA-Z0-9]/g, "_")}`;
  const getArtifactId = (repoName: string, pathOrSha: string) =>
    `artifact:${repoName.toLowerCase()}:${pathOrSha.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const getEmptyStateId = (skillName: string) => `empty:${skillName.toLowerCase().trim()}`;

  // 1. Candidate Node (Column 0: x = 50)
  addNode({
    id: candidateId,
    type: "candidate",
    position: { x: 50, y: 180 },
    data: {
      type: "candidate",
      name: candidate?.name || "Candidate",
      githubUsername: githubUsername || "anonymous",
      analyzedAt,
    },
  });

  // Filter skills if requested
  const isFilteringSkill = selectedSkill !== "ALL" && selectedSkill.trim().length > 0;
  const filteredVerifications: SkillVerificationResult[] = isFilteringSkill
    ? evaluation.verifications.filter(
        (v: SkillVerificationResult) => v.skill.toLowerCase() === selectedSkill.toLowerCase()
      )
    : evaluation.verifications;

  // Build repository lookup for rich metadata
  const repoMetaMap = new Map<string, GitHubRepository>();
  if (githubResult?.repositories) {
    for (const r of githubResult.repositories) {
      repoMetaMap.set(r.name.toLowerCase(), r);
    }
  }

  // Pre-calculate vertical layout positions
  const Y_OFFSET_START = 80;
  const Y_SPACING = 150;

  filteredVerifications.forEach((verification: SkillVerificationResult, skillIndex: number) => {
    const canonicalName = verification.skill;
    const skillY = Y_OFFSET_START + skillIndex * Y_SPACING;

    // Find matching resume claim if available
    const matchedClaim = claims.find(
      (c: ResumeClaim) =>
        c.canonicalSkill.toLowerCase() === canonicalName.toLowerCase() ||
        c.displayName.toLowerCase() === canonicalName.toLowerCase()
    );

    // 2. Claim Node (Column 1: x = 340)
    const claimNodeId = getClaimId(canonicalName);
    addNode({
      id: claimNodeId,
      type: "claim",
      position: { x: 340, y: skillY },
      data: {
        type: "claim",
        displayName: matchedClaim?.displayName || canonicalName,
        canonicalSkill: canonicalName,
        category: matchedClaim?.category || "Technical Skill",
        sourceSection: matchedClaim?.sourceSection,
        sourceText: matchedClaim?.sourceText,
      },
    });

    // Edge: Candidate -> Claim
    addEdge({
      id: `edge:${candidateId}->${claimNodeId}`,
      source: candidateId,
      target: claimNodeId,
      style: { stroke: "#64748b", strokeWidth: 1.5 },
      data: { relationshipType: "claim", isStrong: true },
    });

    // 3. Skill Node (Column 2: x = 640)
    const skillNodeId = getSkillId(canonicalName);
    const isProven = verification.status === "PROVEN";
    const isPartial = verification.status === "PARTIAL";

    addNode({
      id: skillNodeId,
      type: "skill",
      position: { x: 640, y: skillY },
      data: {
        type: "skill",
        skill: canonicalName,
        status: verification.status,
        evidenceScore: verification.evidenceScore,
        reason: verification.reason,
        repositoryCount: verification.repositoryCount ?? 0,
        evidenceCount: verification.evidenceItems.length,
        distinctSignalTypes: verification.distinctSignalTypes ?? [],
      },
    });

    // Edge: Claim -> Skill
    const skillColor = isProven ? "#10b981" : isPartial ? "#f59e0b" : "#ef4444";
    addEdge({
      id: `edge:${claimNodeId}->${skillNodeId}`,
      source: claimNodeId,
      target: skillNodeId,
      animated: isProven,
      style: {
        stroke: skillColor,
        strokeWidth: 2,
        strokeDasharray: isProven ? undefined : isPartial ? "4 4" : "2 2",
      },
      data: { relationshipType: "verification", isStrong: isProven },
    });

    // 4. Repositories & Evidence or Empty State (Column 3+)
    if (verification.evidenceItems.length === 0) {
      // Empty Evidence Node for CLAIMED-ONLY
      const emptyId = getEmptyStateId(canonicalName);
      addNode({
        id: emptyId,
        type: "empty_state",
        position: { x: 960, y: skillY },
        data: {
          type: "empty_state",
          skill: canonicalName,
          message: "No sufficient public GitHub evidence found for this claim.",
        },
      });

      addEdge({
        id: `edge:${skillNodeId}->${emptyId}`,
        source: skillNodeId,
        target: emptyId,
        style: { stroke: "#ef4444", strokeWidth: 1.5, strokeDasharray: "4 4" },
        data: { relationshipType: "empty", isStrong: false },
      });
    } else {
      // Group evidence items by repository for clean graph topology
      const repoGroups = new Map<string, GitHubEvidenceItem[]>();
      for (const item of verification.evidenceItems) {
        const repoName = item.repositoryName || "unnamed-repo";
        const group = repoGroups.get(repoName) || [];
        group.push(item);
        repoGroups.set(repoName, group);
      }

      let repoOffsetIndex = 0;
      repoGroups.forEach((itemsInRepo, repoName) => {
        const repoId = getRepoId(repoName);
        const repoY = skillY + (repoOffsetIndex - (repoGroups.size - 1) / 2) * 110;
        repoOffsetIndex++;

        const repoMeta = repoMetaMap.get(repoName.toLowerCase());

        // 4A. Repository Node (Column 3: x = 980)
        addNode({
          id: repoId,
          type: "repository",
          position: { x: 980, y: repoY },
          data: {
            type: "repository",
            name: repoName,
            fullName: repoMeta?.fullName || `${githubUsername}/${repoName}`,
            htmlUrl: repoMeta?.htmlUrl || `https://github.com/${githubUsername}/${repoName}`,
            description: repoMeta?.description,
            language: repoMeta?.language,
            stargazersCount: repoMeta?.stargazersCount,
          },
        });

        // Edge: Skill -> Repository
        addEdge({
          id: `edge:${skillNodeId}->${repoId}`,
          source: skillNodeId,
          target: repoId,
          style: { stroke: isProven ? "#10b981" : "#f59e0b", strokeWidth: 1.5 },
          data: { relationshipType: "repository", isStrong: isProven },
        });

        // 4B. Evidence Nodes (Column 4: x = 1320)
        itemsInRepo.forEach((evidenceItem, itemIdx) => {
          const evidenceId = getEvidenceId(
            repoName,
            evidenceItem.type,
            evidenceItem.id || String(itemIdx)
          );
          const evidenceY = repoY + (itemIdx - (itemsInRepo.length - 1) / 2) * 75;
          const isStrongSignal = STRONG_TECHNICAL_TYPES.has(evidenceItem.type);

          addNode({
            id: evidenceId,
            type: "evidence",
            position: { x: 1320, y: evidenceY },
            data: {
              type: "evidence",
              evidenceType: evidenceItem.type,
              extractedFact: evidenceItem.extractedFact,
              repositoryName: repoName,
              sourceUrl: evidenceItem.sourceUrl,
              isStrongTechnical: isStrongSignal,
              filePath: evidenceItem.filePath,
            },
          });

          // Edge: Repository -> Evidence
          addEdge({
            id: `edge:${repoId}->${evidenceId}`,
            source: repoId,
            target: evidenceId,
            style: {
              stroke: isStrongSignal ? "#38bdf8" : "#94a3b8",
              strokeWidth: 1.25,
              strokeDasharray: isStrongSignal ? undefined : "3 3",
            },
            data: { relationshipType: "evidence", isStrong: isStrongSignal },
          });

          // 4C. Artifact Node (Column 5: x = 1680) - when file or commit exists
          const artifactKey = evidenceItem.filePath || evidenceItem.commitSha;
          if (artifactKey) {
            const artifactId = getArtifactId(repoName, artifactKey);
            addNode({
              id: artifactId,
              type: "artifact",
              position: { x: 1680, y: evidenceY },
              data: {
                type: "artifact",
                label: evidenceItem.filePath || `commit: ${evidenceItem.commitSha?.slice(0, 7)}`,
                filePath: evidenceItem.filePath,
                commitSha: evidenceItem.commitSha,
                repositoryName: repoName,
                sourceUrl: evidenceItem.sourceUrl,
              },
            });

            // Edge: Evidence -> Artifact
            addEdge({
              id: `edge:${evidenceId}->${artifactId}`,
              source: evidenceId,
              target: artifactId,
              style: { stroke: "#a855f7", strokeWidth: 1.25 },
              data: { relationshipType: "artifact", isStrong: true },
            });
          }
        });
      });
    }
  });

  return { nodes, edges };
}
