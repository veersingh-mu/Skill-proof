import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/skills/status-badge";
import { type SkillStatus } from "@/types";

export function SkillCard({ name, status, detail }: { name: string; status: SkillStatus; detail: string }) { return <Card className="border-border/80 bg-card/60"><CardContent className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><div className="flex items-center gap-3"><StatusBadge status={status} /><ChevronRight className="size-4 text-muted-foreground" /></div></CardContent></Card>; }
