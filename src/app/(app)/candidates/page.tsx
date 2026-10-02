import { Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
export default function CandidatesPage() { return <AppShell><PageHeader title="Candidates" description="Saved candidate profiles will appear here once analysis persistence is introduced in a later phase." /><div className="mt-10"><EmptyState icon={Users} title="No candidates yet" description="Analyze a candidate in a future phase to start building an evidence-backed profile." /></div></AppShell>; }
