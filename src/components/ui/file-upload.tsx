"use client";
import { useId } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUpload({
  file,
  error,
  disabled,
  onChange,
  onRemove,
}: {
  file?: File;
  error?: string;
  disabled?: boolean;
  onChange: (file?: File) => void;
  onRemove: () => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="relative rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 sm:p-5 transition-colors hover:border-indigo-400/50 hover:bg-muted/30">
        <input
          id={id}
          type="file"
          accept="application/pdf"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => onChange(event.target.files?.[0])}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label
            htmlFor={file ? undefined : id}
            className={`flex min-w-0 items-center gap-3 ${!file && !disabled ? "cursor-pointer" : ""}`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <FileText className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {file?.name ?? "Tap to select a resume PDF"}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                PDF only · Maximum size 5 MB
              </span>
            </span>
          </label>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {file ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={onRemove}
                className="text-xs h-10 min-h-[44px] px-3.5 text-muted-foreground hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="size-4 mr-1.5" /> Remove
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                asChild
                className="text-xs h-10 min-h-[44px] px-4 cursor-pointer border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
              >
                <label htmlFor={id}>
                  <Upload className="size-4 mr-1.5" /> Browse PDF
                </label>
              </Button>
            )}
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
