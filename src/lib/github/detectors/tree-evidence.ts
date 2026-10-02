import { IGNORED_PATH_SEGMENTS } from "../config";
import type { GitHubEvidenceType } from "@/types/github";

export interface TreeEvidenceMatch {
  filePath: string;
  type: GitHubEvidenceType;
  skillHints: string[];
  extractedFact: string;
}

export function analyzeFileTree(
  filePaths: string[]
): TreeEvidenceMatch[] {
  const matches: TreeEvidenceMatch[] = [];

  // Filter out ignored paths (node_modules, .git, etc.)
  const validPaths = filePaths.filter((path) => {
    const segments = path.split("/");
    return !segments.some((seg) => (IGNORED_PATH_SEGMENTS as readonly string[]).includes(seg));
  });

  for (const path of validPaths) {
    const lower = path.toLowerCase();
    const filename = lower.split("/").pop() || "";

    // 1. Docker Detection
    if (filename === "dockerfile" || filename.startsWith("dockerfile.")) {
      matches.push({
        filePath: path,
        type: "dockerfile",
        skillHints: ["Docker"],
        extractedFact: "Dockerfile detected in repository.",
      });
    } else if (
      filename === "docker-compose.yml" ||
      filename === "docker-compose.yaml" ||
      filename === "compose.yml" ||
      filename === "compose.yaml"
    ) {
      matches.push({
        filePath: path,
        type: "docker_compose",
        skillHints: ["Docker"],
        extractedFact: "Docker Compose multi-container configuration detected.",
      });
    }

    // 2. Kubernetes Detection
    if (
      lower.includes("k8s/") ||
      lower.includes("kubernetes/") ||
      filename === "deployment.yaml" ||
      filename === "deployment.yml" ||
      filename === "service.yaml" ||
      filename === "service.yml" ||
      filename === "ingress.yaml" ||
      filename === "ingress.yml"
    ) {
      matches.push({
        filePath: path,
        type: "kubernetes_manifest",
        skillHints: ["Kubernetes"],
        extractedFact: "Kubernetes configuration / manifest detected.",
      });
    }

    // 3. CI/CD Detection (GitHub Actions)
    if (lower.startsWith(".github/workflows/") && (lower.endsWith(".yml") || lower.endsWith(".yaml"))) {
      matches.push({
        filePath: path,
        type: "ci_cd",
        skillHints: ["GitHub Actions", "CI/CD"],
        extractedFact: "GitHub Actions automated CI/CD workflow detected.",
      });
    }

    // 4. Test Detection
    const isTestPath =
      lower.includes("/tests/") ||
      lower.includes("/__tests__/") ||
      lower.startsWith("tests/") ||
      lower.startsWith("__tests__/");

    const isTestFile =
      /\.(test|spec)\.(ts|tsx|js|jsx)$/i.test(filename) ||
      /^test_.*\.py$/i.test(filename) ||
      /.*_test\.py$/i.test(filename) ||
      /.*_test\.go$/i.test(filename) ||
      /.*test\.java$/i.test(filename);

    if (isTestPath || isTestFile) {
      matches.push({
        filePath: path,
        type: "test",
        skillHints: ["Testing"],
        extractedFact: "Automated test file detected.",
      });
    }

    // 5. Framework & Tooling markers
    if (filename.startsWith("next.config.")) {
      matches.push({
        filePath: path,
        type: "framework",
        skillHints: ["Next.js", "React"],
        extractedFact: "Next.js configuration file detected.",
      });
    } else if (filename.startsWith("tailwind.config.")) {
      matches.push({
        filePath: path,
        type: "framework",
        skillHints: ["Tailwind CSS"],
        extractedFact: "Tailwind CSS configuration detected.",
      });
    } else if (filename === "manage.py") {
      matches.push({
        filePath: path,
        type: "framework",
        skillHints: ["Django", "Python"],
        extractedFact: "Django management script detected.",
      });
    }

    // 6. Cloud & AWS specific configurations
    if (
      filename === "cdk.json" ||
      filename === "template.yaml" ||
      filename === "sam.yaml" ||
      (lower.endsWith(".tf") && (filename.includes("aws") || lower.includes("/aws/")))
    ) {
      matches.push({
        filePath: path,
        type: "cloud_configuration",
        skillHints: ["AWS"],
        extractedFact: "AWS / Cloud infrastructure configuration detected.",
      });
    }
  }

  return matches;
}
