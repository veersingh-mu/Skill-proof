import { type NextRequest, NextResponse } from "next/server";
import { extractResumeInformation } from "@/lib/resume/extract";
import { parseResumePdf, ResumeParseError, validateResumeFile } from "@/lib/resume/parser";
import { resumeAnalysisResponseSchema } from "@/lib/resume/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Please attach a resume PDF." }, { status: 400 });
    const data = new Uint8Array(await file.arrayBuffer());
    validateResumeFile({ filename: file.name, mimeType: file.type, size: file.size, signature: data });
    const parsed = await parseResumePdf(data, file.name);
    const extracted = extractResumeInformation(parsed.text);
    const payload = resumeAnalysisResponseSchema.parse({ candidate: { name: extracted.candidate.name, email: extracted.candidate.email }, githubUsername: extracted.githubUsername, skills: extracted.claims, metadata: parsed.metadata });
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ResumeParseError) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    return NextResponse.json({ error: "Unable to process this resume. Please upload another text-based PDF." }, { status: 500 });
  }
}
