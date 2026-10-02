import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed border-border/80 bg-card/40 backdrop-blur-sm">
      <CardContent className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
        <span className="grid size-12 place-items-center rounded-2xl border border-border/80 bg-secondary/50 text-muted-foreground shadow-xs">
          <Icon className="size-5 text-indigo-400" />
        </span>
        <h3 className="mt-4 text-base font-medium tracking-tight text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  );
}
