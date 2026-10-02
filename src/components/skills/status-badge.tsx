import { CheckCircle2, CircleAlert, CircleDashed, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type SkillStatus } from "@/types";

interface StatusBadgeProps {
  status: SkillStatus | "NOT_VERIFIED" | "NOT_FOUND";
  className?: string;
  size?: "sm" | "default";
}

const config: Record<
  string,
  { label: string; icon: typeof CheckCircle2; className: string; dotClass: string }
> = {
  PROVEN: {
    label: "Proven",
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:border-emerald-400/25 dark:bg-emerald-400/[0.08] dark:text-emerald-300",
    dotClass: "bg-emerald-400",
  },
  PARTIAL: {
    label: "Partial",
    icon: CircleAlert,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400 dark:border-amber-400/25 dark:bg-amber-400/[0.08] dark:text-amber-300",
    dotClass: "bg-amber-400",
  },
  CLAIMED_ONLY: {
    label: "Claimed Only",
    icon: CircleDashed,
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400",
    dotClass: "bg-zinc-400",
  },
  NOT_VERIFIED: {
    label: "Not Verified",
    icon: HelpCircle,
    className: "border-zinc-700 bg-zinc-900/60 text-zinc-400",
    dotClass: "bg-zinc-500",
  },
  NOT_FOUND: {
    label: "Not Verified",
    icon: HelpCircle,
    className: "border-zinc-700 bg-zinc-900/60 text-zinc-400",
    dotClass: "bg-zinc-500",
  },
};

export function StatusBadge({ status, className, size = "default" }: StatusBadgeProps) {
  const item = config[status] ?? config.NOT_VERIFIED;
  const Icon = item.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium tracking-wide transition-colors",
        size === "sm" ? "px-1.5 py-0 text-[11px]" : "px-2 py-0.5 text-xs",
        item.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0 animate-pulse", item.dotClass)} />
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      {item.label}
    </Badge>
  );
}

