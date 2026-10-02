import { type ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-indigo-400 uppercase">
          {eyebrow ?? "SkillProof"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>
      {children && <div className="shrink-0 pt-2 sm:pt-0">{children}</div>}
    </div>
  );
}
