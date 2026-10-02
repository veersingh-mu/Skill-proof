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
    <div className="flex flex-col justify-between gap-4 border-b border-[#E7DCD1] pb-6 sm:flex-row sm:items-end">
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#A95F3D] uppercase">
          {eyebrow ?? "SkillProof"}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#241914] sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-xs leading-relaxed text-[#756B64] sm:text-sm">
          {description}
        </p>
      </div>
      {children && <div className="shrink-0 pt-2 sm:pt-0">{children}</div>}
    </div>
  );
}
