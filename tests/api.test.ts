import { describe, expect, it } from "vitest";
import { POST } from "../src/app/api/resumes/analyze/route";
import { NextRequest } from "next/server";

const VALID_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8IC9GMSA0IDAgUiA+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgo3MiA3MjAgVGQKKEFsaXggU2hhcm1hIFJlYWN0IERvY2tlcikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDQgMDAwMDAgbiAKMDAwMDAwMDMxMyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwNgolJUVPRgo=";

describe("POST /api/resumes/analyze", () => {
  it("returns 400 if no resume file is attached", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost:3000/api/resumes/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Please attach a resume PDF.");
  });

  it("returns 400 for non-pdf file uploads", async () => {
    const formData = new FormData();
    const file = new File(["dummy text"], "resume.txt", { type: "text/plain" });
    formData.append("resume", file);

    const req = new NextRequest("http://localhost:3000/api/resumes/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Please upload a PDF resume.");
  });

  it("processes a valid PDF and returns structured JSON with UNVERIFIED claims", async () => {
    const buffer = Buffer.from(VALID_PDF_BASE64, "base64");
    const file = new File([buffer], "alex-resume.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("resume", file);

    const req = new NextRequest("http://localhost:3000/api/resumes/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toHaveProperty("candidate");
    expect(data).toHaveProperty("skills");
    expect(data).toHaveProperty("metadata");
    expect(data.metadata.filename).toBe("alex-resume.pdf");
    expect(data.metadata.pageCount).toBe(1);

    // Verify skills include extracted items
    const skillNames = data.skills.map((s: { canonicalSkill: string }) => s.canonicalSkill);
    expect(skillNames).toEqual(expect.arrayContaining(["React", "Docker"]));

    // Crucial requirement: all claims must have status UNVERIFIED
    expect(data.skills.every((s: { status: string }) => s.status === "UNVERIFIED")).toBe(true);
  });
});
