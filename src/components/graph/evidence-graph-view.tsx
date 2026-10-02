"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Filter, Network, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CandidateVerificationSession } from "@/lib/evidence";
import { buildEvidenceGraph, type EvidenceNodePayload } from "@/lib/evidence/graph";
import {
  ArtifactNode,
  CandidateNode,
  ClaimNode,
  EmptyStateNode,
  EvidenceNode,
  RepositoryNode,
  SkillNode,
} from "./custom-nodes";
import { GraphLegend } from "./graph-legend";
import { NodeDetailPanel } from "./node-detail-panel";

interface EvidenceGraphViewProps {
  session: CandidateVerificationSession;
}

const nodeTypes = {
  candidate: CandidateNode,
  claim: ClaimNode,
  skill: SkillNode,
  repository: RepositoryNode,
  evidence: EvidenceNode,
  artifact: ArtifactNode,
  empty_state: EmptyStateNode,
};

export function EvidenceGraphView({ session }: EvidenceGraphViewProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>("ALL");
  const [selectedNodeData, setSelectedNodeData] = useState<EvidenceNodePayload | null>(null);

  // Generate deterministic graph model
  const graphModel = useMemo(() => {
    return buildEvidenceGraph(session, { selectedSkill });
  }, [session, selectedSkill]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graphModel.nodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphModel.edges as unknown as Edge[]);

  // Update nodes and edges whenever graphModel changes (e.g. skill filter changes)
  useEffect(() => {
    setNodes(graphModel.nodes as unknown as Node[]);
    setEdges(graphModel.edges as unknown as Edge[]);
  }, [graphModel, setNodes, setEdges]);

  // Handle node clicks for detail inspection
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNodeData((node.data as unknown as EvidenceNodePayload) || null);
  }, []);

  // List of available skills for filter pill bar
  const availableSkills = useMemo(() => {
    return session.evaluation.verifications.map((v) => ({
      name: v.skill,
      status: v.status,
    }));
  }, [session]);

  return (
    <section
      aria-label="Interactive Evidence Graph"
      className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden flex flex-col space-y-4 p-5 md:p-6"
    >
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Network className="size-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Phase 6 • Interactive Verification Graph
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Why this skill is verified
          </h2>
          <p className="text-xs text-muted-foreground">
            Trace every verification result back to the GitHub evidence and repository artifacts that support it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSkill("ALL");
              setSelectedNodeData(null);
            }}
            className="text-xs h-8 gap-1.5 border-border/80 hover:bg-muted/50"
          >
            <RotateCcw className="size-3" />
            Reset Layout
          </Button>
        </div>
      </div>

      {/* Skill Filter Bar (Requirement 9) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Filter className="size-3.5" />
          <span>Focus on Skill:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter graph by skill">
          <Button
            variant={selectedSkill === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSkill("ALL")}
            className={`text-xs h-7 px-2.5 rounded-lg ${
              selectedSkill === "ALL"
                ? "bg-foreground text-background font-semibold"
                : "border-border/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Skills ({availableSkills.length})
          </Button>

          {availableSkills.map((s) => {
            const isSelected = selectedSkill.toLowerCase() === s.name.toLowerCase();
            const isProven = s.status === "PROVEN";
            const isPartial = s.status === "PARTIAL";

            const badgeColor = isProven
              ? "text-emerald-400"
              : isPartial
              ? "text-amber-400"
              : "text-red-400";

            return (
              <Button
                key={s.name}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSkill(s.name)}
                className={`text-xs h-7 px-2.5 rounded-lg gap-1.5 ${
                  isSelected
                    ? isProven
                      ? "bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                      : isPartial
                      ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      : "bg-red-500 hover:bg-red-600 text-white font-semibold"
                    : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <span className={`size-1.5 rounded-full ${isSelected ? "bg-black" : badgeColor}`} />
                {s.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[440px] sm:h-[520px] md:h-[580px] rounded-xl border border-border/80 bg-zinc-950/80 overflow-hidden shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          aria-label="Interactive skill proof evidence graph"
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls className="!bg-card/90 !border-border !fill-foreground !rounded-lg" />
          <MiniMap
            zoomable
            pannable
            nodeStrokeColor="#475569"
            nodeColor={(n) => {
              if (n.type === "candidate") return "#10b981";
              if (n.type === "skill") return "#3b82f6";
              if (n.type === "repository") return "#0284c7";
              if (n.type === "evidence") return "#06b6d4";
              if (n.type === "artifact") return "#a855f7";
              return "#ef4444";
            }}
            className="!bg-zinc-900/90 !border-border !rounded-lg hidden sm:block"
          />
        </ReactFlow>

        {/* Floating Legend in Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-10 max-w-sm hidden sm:block">
          <GraphLegend />
        </div>

        {/* Floating Node Detail Inspector in Top-Right on desktop, bounded overlay on mobile */}
        {selectedNodeData && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm z-20">
            <NodeDetailPanel
              data={selectedNodeData}
              onClose={() => setSelectedNodeData(null)}
            />
          </div>
        )}
      </div>

      {/* Mobile Legend Footer */}
      <div className="block sm:hidden pt-2">
        <GraphLegend />
      </div>
    </section>
  );
}
