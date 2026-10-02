import "server-only";
import "@/lib/resume/polyfill";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MIN_EXTRACTED_CHARACTERS = 20;

export class ResumeParseError extends Error {
  constructor(public readonly code: "INVALID_FILE" | "FILE_TOO_LARGE" | "CORRUPT_PDF" | "NO_EXTRACTABLE_TEXT", message: string) { super(message); }
}

export interface ParsedResume { text: string; metadata: { filename: string; pageCount: number } }

export function validateResumeFile({ filename, mimeType, size, signature }: { filename: string; mimeType: string; size: number; signature: Uint8Array }) {
  if (!filename.toLowerCase().endsWith(".pdf") || (mimeType && mimeType !== "application/pdf")) throw new ResumeParseError("INVALID_FILE", "Please upload a PDF resume.");
  if (size === 0) throw new ResumeParseError("INVALID_FILE", "The uploaded PDF is empty.");
  if (size > MAX_RESUME_BYTES) throw new ResumeParseError("FILE_TOO_LARGE", "Please upload a PDF smaller than 5 MB.");
  if (new TextDecoder().decode(signature.slice(0, 5)) !== "%PDF-") throw new ResumeParseError("INVALID_FILE", "This file does not appear to be a valid PDF.");
}

async function initPdfWorker() {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g.pdfjsWorker) {
    try {
      // Direct import ensures Next.js/Turbopack bundles the worker code into the deployment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs" as any);
      g.pdfjsWorker = { WorkerMessageHandler: worker.WorkerMessageHandler };
    } catch (e) {
      console.warn("[initPdfWorker] Could not pre-bundle workerMessageHandler:", e);
    }
  }
}

export async function parseResumePdf(data: Uint8Array, filename: string): Promise<ParsedResume> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parser: any;
  try {
    await initPdfWorker();
    const { PDFParse } = await import("pdf-parse");
    parser = new PDFParse({ data });
    const result = await parser.getText();
    const text = (result.text || "").replace(/\u0000/g, "").replace(/\s+\n/g, "\n").trim();
    if (text.length < MIN_EXTRACTED_CHARACTERS) throw new ResumeParseError("NO_EXTRACTABLE_TEXT", "Text could not be extracted from this PDF. Please upload a text-based resume.");
    return { text, metadata: { filename: filename.replace(/[\\/]/g, "_"), pageCount: result.total ?? 1 } };
  } catch (error) {
    console.error("[parseResumePdf internal error]", error instanceof Error ? error.stack : error);
    if (error instanceof ResumeParseError) throw error;
    throw new ResumeParseError("CORRUPT_PDF", "Unable to process this resume. Please upload another text-based PDF.");
  } finally {
    try {
      await parser?.destroy();
    } catch {
      // ignore parser cleanup errors
    }
  }
}
