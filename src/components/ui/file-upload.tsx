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
      <div className="relative rounded-2xl border-2 border-dashed border-[#E7DCD1] bg-[#FAF7F2] p-5 sm:p-6 transition-all duration-200 hover:border-[#A95F3D] hover:bg-[#F4E2D3]/20">
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
            className={`flex min-w-0 items-center gap-3.5 ${!file && !disabled ? "cursor-pointer" : ""}`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#E8C5B0] bg-[#F4E2D3] text-[#A95F3D]">
              <FileText className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-[#241914]">
                {file?.name ?? "Upload or drag & drop resume PDF"}
              </span>
              <span className="mt-0.5 block text-xs text-[#756B64]">
                PDF format · Maximum size 5 MB
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
                className="text-xs h-10 min-h-[44px] px-3.5 text-[#C94A4A] hover:text-[#C94A4A] hover:bg-[#C94A4A]/10 rounded-xl"
              >
                <Trash2 className="size-4 mr-1.5" /> Remove
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                asChild
                className="text-xs font-semibold h-10 min-h-[44px] px-4 cursor-pointer border-[#A95F3D]/40 text-[#A95F3D] hover:bg-[#F4E2D3]/60 rounded-xl"
              >
                <label htmlFor={id}>
                  <Upload className="size-4 mr-1.5" /> Browse File
                </label>
              </Button>
            )}
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-[#C94A4A]">{error}</p>}
    </div>
  );
}
