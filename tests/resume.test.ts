import { describe, expect, it } from "vitest";
import { extractResumeInformation } from "../src/lib/resume/extract";
import { normalizeSkill } from "../src/lib/resume/normalize";
import { parseResumePdf, validateResumeFile, MAX_RESUME_BYTES } from "../src/lib/resume/parser";
import { DEMO_RESUME_TEXT } from "./fixtures/demo-resume";

// Valid 1-page PDF containing "Alix Sharma React Docker" (length > 20)
const VALID_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8IC9GMSA0IDAgUiA+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgo3MiA3MjAgVGQKKEFsaXggU2hhcm1hIFJlYWN0IERvY2tlcikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDQgMDAwMDAgbiAKMDAwMDAwMDMxMyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwNgolJUVPRgo=";

// PDF with minimal/insufficient text (e.g. scanned image placeholder with < 20 chars)
const MINIMAL_TEXT_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8IC9GMSA0IDAgUiA+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggMjIKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo3MiA3MjAgVGQKKFBhZ2UpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ0IDAwMDAwIG4gCjAwMDAwMDAzMTMgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxODQKJSVFT0YK";

describe("PDF extraction and validation", () => {
  it("extracts text and page count from a text-based PDF", async () => {
    const result = await parseResumePdf(Buffer.from(VALID_PDF_BASE64, "base64"), "alex-resume.pdf");
    expect(result.metadata.pageCount).toBe(1);
    expect(result.metadata.filename).toBe("alex-resume.pdf");
    expect(result.text).toContain("React");
    expect(result.text).toContain("Docker");
  });

  it("rejects invalid file extension and mime type", () => {
    expect(() =>
      validateResumeFile({
        filename: "resume.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 1024,
        signature: new Uint8Array([1, 2, 3]),
      })
    ).toThrow("Please upload a PDF resume.");
  });

  it("rejects empty PDF upload (0 bytes)", () => {
    expect(() =>
      validateResumeFile({
        filename: "empty.pdf",
        mimeType: "application/pdf",
        size: 0,
        signature: new Uint8Array(),
      })
    ).toThrow("The uploaded PDF is empty.");
  });

  it("rejects files exceeding the maximum size limit (5 MB)", () => {
    expect(() =>
      validateResumeFile({
        filename: "huge.pdf",
        mimeType: "application/pdf",
        size: MAX_RESUME_BYTES + 1,
        signature: new TextEncoder().encode("%PDF-1.4"),
      })
    ).toThrow("Please upload a PDF smaller than 5 MB.");
  });

  it("rejects files with invalid PDF magic signature", () => {
    expect(() =>
      validateResumeFile({
        filename: "fake.pdf",
        mimeType: "application/pdf",
        size: 100,
        signature: new TextEncoder().encode("NOTPDF"),
      })
    ).toThrow("This file does not appear to be a valid PDF.");
  });

  it("handles image-only / scanned PDFs where text cannot be extracted", async () => {
    await expect(
      parseResumePdf(Buffer.from(MINIMAL_TEXT_PDF_BASE64, "base64"), "scanned-resume.pdf")
    ).rejects.toThrow("Text could not be extracted from this PDF. Please upload a text-based resume.");
  });

  it("handles corrupt PDF data gracefully without exposing internal parser errors", async () => {
    const corruptData = new TextEncoder().encode("%PDF-corrupted-and-unparseable-data-xyz");
    await expect(parseResumePdf(corruptData, "corrupt.pdf")).rejects.toThrow(
      "Unable to process this resume. Please upload another text-based PDF."
    );
  });
});

describe("skill normalization and alias handling", () => {
  it("normalizes common aliases to canonical names", () => {
    expect(normalizeSkill("React.js")?.canonicalName).toBe("React");
    expect(normalizeSkill("ReactJS")?.canonicalName).toBe("React");
    expect(normalizeSkill("NodeJS")?.canonicalName).toBe("Node.js");
    expect(normalizeSkill("JS")?.canonicalName).toBe("JavaScript");
    expect(normalizeSkill("TS")?.canonicalName).toBe("TypeScript");
    expect(normalizeSkill("Postgres")?.canonicalName).toBe("PostgreSQL");
    expect(normalizeSkill("Mongo")?.canonicalName).toBe("MongoDB");
    expect(normalizeSkill("K8s")?.canonicalName).toBe("Kubernetes");
    expect(normalizeSkill("Github")?.canonicalName).toBe("GitHub");
    expect(normalizeSkill("Golang")?.canonicalName).toBe("Go");
    expect(normalizeSkill("CPP")?.canonicalName).toBe("C++");
    expect(normalizeSkill("GCP")?.canonicalName).toBe("Google Cloud");
    expect(normalizeSkill("Tailwind")?.canonicalName).toBe("Tailwind CSS");
  });

  it("normalizes case-insensitively for multi-letter aliases", () => {
    expect(normalizeSkill("reactjs")?.canonicalName).toBe("React");
    expect(normalizeSkill("k8s")?.canonicalName).toBe("Kubernetes");
    expect(normalizeSkill("postgres")?.canonicalName).toBe("PostgreSQL");
    expect(normalizeSkill("mongodb")?.canonicalName).toBe("MongoDB");
  });

  it("returns undefined for unknown or unsupported skills", () => {
    expect(normalizeSkill("Cobol")).toBeUndefined();
    expect(normalizeSkill("Word")).toBeUndefined();
  });
});

describe("skill extraction and resume claims", () => {
  it("extracts canonical skills from project text with aliases", () => {
    const result = extractResumeInformation("PROJECTS\nBuilt a web application using React.js and NodeJS.");
    const names = result.claims.map((claim) => claim.canonicalSkill);
    expect(names).toEqual(["React", "Node.js"]);
    expect(names).not.toContain("React.js");
    expect(names).not.toContain("NodeJS");
  });

  it("extracts, categorizes, and de-duplicates skills from comprehensive resume", () => {
    const result = extractResumeInformation(DEMO_RESUME_TEXT);
    const canonicalNames = result.claims.map((claim) => claim.canonicalSkill);

    expect(canonicalNames).toEqual(
      expect.arrayContaining(["Python", "React", "Node.js", "Docker", "AWS", "Kubernetes", "PostgreSQL", "FastAPI"])
    );

    // De-duplication check: React is mentioned multiple times, must appear exactly once
    expect(result.claims.filter((claim) => claim.canonicalSkill === "React")).toHaveLength(1);
    expect(result.claims.filter((claim) => claim.canonicalSkill === "Node.js")).toHaveLength(1);

    // Category mapping
    const reactClaim = result.claims.find((claim) => claim.canonicalSkill === "React");
    expect(reactClaim?.category).toBe("Frontend");
    expect(reactClaim?.sourceSection).toBe("SKILLS");

    const dockerClaim = result.claims.find((claim) => claim.canonicalSkill === "Docker");
    expect(dockerClaim?.category).toBe("DevOps");
  });

  it("marks all extracted claims with status UNVERIFIED and never PROVEN/PARTIAL/CLAIMED_ONLY", () => {
    const result = extractResumeInformation(DEMO_RESUME_TEXT);
    expect(result.claims.length).toBeGreaterThan(0);
    expect(result.claims.every((claim) => claim.status === "UNVERIFIED")).toBe(true);
    for (const claim of result.claims) {
      expect((claim.status as string)).not.toBe("PROVEN");
      expect((claim.status as string)).not.toBe("PARTIAL");
      expect((claim.status as string)).not.toBe("CLAIMED_ONLY");
    }
  });

  it("avoids false matches on common English words and letters", () => {
    const text = "Alex Sharma loves to go to the market and take c/o notes for client accounts.";
    const result = extractResumeInformation(text);
    const names = result.claims.map((claim) => claim.canonicalSkill);
    expect(names).not.toContain("Go");
    expect(names).not.toContain("C");
  });

  it("does not falsely detect middle initial C. as C programming language", () => {
    const text = "Alex C. Sharma\nFrontend Engineer";
    const result = extractResumeInformation(text);
    const names = result.claims.map((claim) => claim.canonicalSkill);
    expect(names).not.toContain("C");
  });

  it("extracts C and Go when specified in technical programming language context", () => {
    const text = "Languages: C, C++, Go, Python, Rust";
    const result = extractResumeInformation(text);
    const names = result.claims.map((claim) => claim.canonicalSkill);
    expect(names).toEqual(expect.arrayContaining(["C", "C++", "Go", "Python", "Rust"]));
  });

  it("does not falsely claim GitHub when only GitHub Actions is mentioned", () => {
    const text = "PROJECTS\nConfigured automated deployment with GitHub Actions.";
    const result = extractResumeInformation(text);
    const names = result.claims.map((claim) => claim.canonicalSkill);
    expect(names).toContain("GitHub Actions");
    expect(names).not.toContain("GitHub");
  });
});

describe("GitHub URL extraction", () => {
  it("extracts username from https://github.com/example", () => {
    const text = "Candidate Profile\nhttps://github.com/example\nSoftware Engineer";
    const result = extractResumeInformation(text);
    expect(result.githubUsername).toBe("example");
  });

  it("extracts username with hyphens and numbers", () => {
    const text = "Check my projects at https://github.com/alex-sharma-99/portfolio";
    const result = extractResumeInformation(text);
    expect(result.githubUsername).toBe("alex-sharma-99");
  });

  it("extracts username from github.com without scheme", () => {
    const text = "Email: alex@example.com | github.com/alexsharma";
    const result = extractResumeInformation(text);
    expect(result.githubUsername).toBe("alexsharma");
  });

  it("extracts username from GitHub handle labels", () => {
    const text = "GitHub: @dev-user\nLinkedIn: linkedin.com/in/dev";
    const result = extractResumeInformation(text);
    expect(result.githubUsername).toBe("dev-user");
  });

  it("returns undefined when no GitHub profile is present", () => {
    const text = "Alex Sharma\nalex@example.com\n555-123-4567";
    const result = extractResumeInformation(text);
    expect(result.githubUsername).toBeUndefined();
  });
});

