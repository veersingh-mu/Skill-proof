import { LoaderCircle } from "lucide-react";
export function LoadingState({ label = "Preparing your workspace…" }: { label?: string }) { return <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin text-emerald-300" />{label}</div>; }
