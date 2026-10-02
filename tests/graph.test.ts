import { describe, expect, it } from "vitest";
import { buildEvidenceGraph } from "../src/lib/evidence/graph";
import { createSampleVerificationSession } from "../src/lib/evidence/sample-session";

describe("Phase 6: Interactive Evidence Graph Tests", () => {
  const session = createSampleVerificationSession();

  // ==========================================
  // TEST 1: React PROVEN Graph Topology
  // ==========================================
  it("TEST 1: React PROVEN produces candidate, claim, skill, repository, evidence, and artifact nodes with connected edges", () => {
    const graph = buildEvidenceGraph(session, { selectedSkill: "React" });

    // Node existence
    const candidateNode = graph.nodes.find((n) => n.type === "candidate");
    const claimNode = graph.nodes.find((n) => n.type === "claim" && (n.data as { canonicalSkill: string }).canonicalSkill === "React");
    const skillNode = graph.nodes.find((n) => n.type === "skill" && (n.data as { skill: string }).skill === "React");
    const repoNodes = graph.nodes.filter((n) => n.type === "repository");
    const evidenceNodes = graph.nodes.filter((n) => n.type === "evidence");
    const artifactNodes = graph.nodes.filter((n) => n.type === "artifact");

    expect(candidateNode).toBeDefined();
    expect(claimNode).toBeDefined();
    expect(skillNode).toBeDefined();
    expect(repoNodes.length).toBeGreaterThanOrEqual(1);
    expect(evidenceNodes.length).toBeGreaterThanOrEqual(1);
    expect(artifactNodes.length).toBeGreaterThanOrEqual(1);

    // Skill data verification
    const skillData = skillNode!.data as { status: string; evidenceScore: number };
    expect(skillData.status).toBe("PROVEN");
    expect(skillData.evidenceScore).toBeGreaterThanOrEqual(60);

    // Edges connectivity: candidate -> claim -> skill -> repo -> evidence
    const claimEdge = graph.edges.find((e) => e.source === candidateNode!.id && e.target === claimNode!.id);
    const skillEdge = graph.edges.find((e) => e.source === claimNode!.id && e.target === skillNode!.id);
    expect(claimEdge).toBeDefined();
    expect(skillEdge).toBeDefined();

    // Confirm repository edges
    for (const r of repoNodes) {
      const repoEdge = graph.edges.find((e) => e.source === skillNode!.id && e.target === r.id);
      expect(repoEdge).toBeDefined();
    }
  });

  // ==========================================
  // TEST 2: Python CLAIMED-ONLY Graph Topology
  // ==========================================
  it("TEST 2: Python CLAIMED-ONLY produces candidate, claim, skill, and empty-state node with NO fake repos or evidence", () => {
    const graph = buildEvidenceGraph(session, { selectedSkill: "Python" });

    const skillNode = graph.nodes.find((n) => n.type === "skill" && (n.data as { skill: string }).skill === "Python");
    const repoNodes = graph.nodes.filter((n) => n.type === "repository");
    const evidenceNodes = graph.nodes.filter((n) => n.type === "evidence");
    const artifactNodes = graph.nodes.filter((n) => n.type === "artifact");
    const emptyNode = graph.nodes.find((n) => n.type === "empty_state");

    expect(skillNode).toBeDefined();
    const skillData = skillNode!.data as { status: string };
    expect(skillData.status).toBe("CLAIMED_ONLY");

    // Strictly NO fabricated repository, evidence, or artifact nodes
    expect(repoNodes.length).toBe(0);
    expect(evidenceNodes.length).toBe(0);
    expect(artifactNodes.length).toBe(0);

    // Empty state node must be connected
    expect(emptyNode).toBeDefined();
    const emptyEdge = graph.edges.find((e) => e.source === skillNode!.id && e.target === emptyNode!.id);
    expect(emptyEdge).toBeDefined();
  });

  // ==========================================
  // TEST 3: Docker PARTIAL Graph Topology
  // ==========================================
  it("TEST 3: Docker PARTIAL produces Freshtrust repo with Dockerfile and compose evidence", () => {
    const graph = buildEvidenceGraph(session, { selectedSkill: "Docker" });

    const skillNode = graph.nodes.find((n) => n.type === "skill" && (n.data as { skill: string }).skill === "Docker");
    expect(skillNode).toBeDefined();
    const skillData = skillNode!.data as { status: string };
    expect(skillData.status).toBe("PARTIAL");

    // Repository node should be Freshtrust
    const freshtrustNode = graph.nodes.find((n) => n.type === "repository" && (n.data as { name: string }).name === "Freshtrust");
    expect(freshtrustNode).toBeDefined();

    // Evidence nodes should contain Dockerfile and compose
    const dockerfileEvidence = graph.nodes.find(
      (n) => n.type === "evidence" && (n.data as { evidenceType: string }).evidenceType === "dockerfile"
    );
    const composeEvidence = graph.nodes.find(
      (n) => n.type === "evidence" && (n.data as { evidenceType: string }).evidenceType === "docker_compose"
    );

    expect(dockerfileEvidence).toBeDefined();
    expect(composeEvidence).toBeDefined();

    // Artifact nodes should exist for the files
    const dockerArtifact = graph.nodes.find(
      (n) => n.type === "artifact" && (n.data as { label: string }).label === "Dockerfile"
    );
    expect(dockerArtifact).toBeDefined();
  });

  // ==========================================
  // TEST 4: Duplicate Evidence Deduplication
  // ==========================================
  it("TEST 4: Repositories and artifacts are deduplicated when multiple evidence items reference them", () => {
    // Session has multiple React evidence items pointing to the same repository "Freshtrust"
    const graph = buildEvidenceGraph(session, { selectedSkill: "React" });

    const freshtrustNodes = graph.nodes.filter(
      (n) => n.type === "repository" && (n.data as { name: string }).name === "Freshtrust"
    );

    // Must be exactly ONE repository node for Freshtrust
    expect(freshtrustNodes.length).toBe(1);

    // Node IDs in graph must all be unique
    const nodeIds = graph.nodes.map((n) => n.id);
    const uniqueIds = new Set(nodeIds);
    expect(nodeIds.length).toBe(uniqueIds.size);
  });

  // ==========================================
  // TEST 5: Stable IDs
  // ==========================================
  it("TEST 5: Same input session generates identical deterministic node IDs across runs", () => {
    const run1 = buildEvidenceGraph(session);
    const run2 = buildEvidenceGraph(session);

    expect(run1.nodes.length).toBe(run2.nodes.length);
    expect(run1.edges.length).toBe(run2.edges.length);

    for (let i = 0; i < run1.nodes.length; i++) {
      expect(run1.nodes[i].id).toBe(run2.nodes[i].id);
      expect(run1.nodes[i].type).toBe(run2.nodes[i].type);
      expect(run1.nodes[i].position).toEqual(run2.nodes[i].position);
    }
  });

  // ==========================================
  // TEST 6: Direct GitHub URLs
  // ==========================================
  it("TEST 6: Evidence and artifact nodes preserve factual public GitHub source URLs", () => {
    const graph = buildEvidenceGraph(session, { selectedSkill: "React" });

    const artifactNodes = graph.nodes.filter((n) => n.type === "artifact");
    expect(artifactNodes.length).toBeGreaterThan(0);

    for (const art of artifactNodes) {
      const data = art.data as { sourceUrl: string };
      expect(data.sourceUrl).toMatch(/^https:\/\/github\.com\//);
      expect(data.sourceUrl).not.toContain("ghp_");
      expect(data.sourceUrl).not.toContain("token");
    }
  });

  // ==========================================
  // TEST 7: Multiple Skills Sharing a Repository
  // ==========================================
  it("TEST 7: Multiple skills sharing a repository connect to the same repository node without duplication", () => {
    // React, Node.js, and TypeScript all share "Freshtrust"
    const graph = buildEvidenceGraph(session);

    const freshtrustNodes = graph.nodes.filter(
      (n) => n.type === "repository" && (n.data as { name: string }).name === "Freshtrust"
    );
    expect(freshtrustNodes.length).toBe(1);

    const freshtrustId = freshtrustNodes[0].id;
    const incomingEdges = graph.edges.filter((e) => e.target === freshtrustId);

    // Multiple skills connect to the single Freshtrust node
    expect(incomingEdges.length).toBeGreaterThanOrEqual(2);
  });

  // ==========================================
  // TEST 8: Empty Session
  // ==========================================
  it("TEST 8: Null or undefined session returns empty graph without crashing", () => {
    const empty1 = buildEvidenceGraph(null);
    expect(empty1.nodes).toEqual([]);
    expect(empty1.edges).toEqual([]);

    const empty2 = buildEvidenceGraph(undefined);
    expect(empty2.nodes).toEqual([]);
    expect(empty2.edges).toEqual([]);
  });
});
