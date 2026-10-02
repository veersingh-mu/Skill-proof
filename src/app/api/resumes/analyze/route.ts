import "@/lib/resume/polyfill";
import { type NextRequest, NextResponse } from "next/server";
import { extractResumeInformation } from "@/lib/resume/extract";
import { parseResumePdf, ResumeParseError, validateResumeFile } from "@/lib/resume/parser";
import { resumeAnalysisResponseSchema } from "@/lib/resume/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("[Resume Analysis] Request received");
    const formData = await request.formData();
    const file = formData.get("resume");
    if (!(file instanceof File)) {
      console.warn("[Resume Analysis] Missing or invalid file payload");
      return NextResponse.json({ error: "Please attach a resume PDF." }, { status: 400 });
    }

    const sizeKb = Math.round(file.size / 1024);
    console.log(`[Resume Analysis] PDF received: ${file.name} (${sizeKb} KB)`);

    const data = new Uint8Array(await file.arrayBuffer());
    validateResumeFile({ filename: file.name, mimeType: file.type, size: file.size, signature: data });

    console.log("[Resume Analysis] PDF parsing started");
    const parsed = await parseResumePdf(data, file.name);
    console.log(`[Resume Analysis] PDF text extraction completed (${parsed.text.length} characters)`);

    const extracted = extractResumeInformation(parsed.text);
    console.log(`[Resume Analysis] Skill extraction completed (${extracted.claims.length} claims found)`);

    const payload = resumeAnalysisResponseSchema.parse({
      candidate: { name: extracted.candidate.name, email: extracted.candidate.email },
      githubUsername: extracted.githubUsername,
      skills: extracted.claims,
      metadata: parsed.metadata,
    });

    console.log("[Resume Analysis] Returning successful analysis payload");
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("[Resume Analysis] Error processing resume:", error instanceof Error ? error.message : error);
    if (error instanceof ResumeParseError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Unable to process this resume. Please upload another text-based PDF." },
      { status: 500 }
    );
  }
}
