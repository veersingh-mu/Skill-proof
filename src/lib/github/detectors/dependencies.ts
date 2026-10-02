

interface DependencyMapping {
  packageName: string;
  skillHints: string[];
}

const NPM_MAPPINGS: DependencyMapping[] = [
  { packageName: "react", skillHints: ["React"] },
  { packageName: "react-dom", skillHints: ["React"] },
  { packageName: "next", skillHints: ["Next.js", "React"] },
  { packageName: "vue", skillHints: ["Vue"] },
  { packageName: "@angular/core", skillHints: ["Angular"] },
  { packageName: "tailwindcss", skillHints: ["Tailwind CSS"] },
  { packageName: "express", skillHints: ["Express", "Node.js"] },
  { packageName: "fastify", skillHints: ["Node.js"] },
  { packageName: "nestjs", skillHints: ["Node.js", "TypeScript"] },
  { packageName: "pg", skillHints: ["PostgreSQL"] },
  { packageName: "postgres", skillHints: ["PostgreSQL"] },
  { packageName: "mysql2", skillHints: ["MySQL"] },
  { packageName: "mongodb", skillHints: ["MongoDB"] },
  { packageName: "mongoose", skillHints: ["MongoDB", "Node.js"] },
  { packageName: "ioredis", skillHints: ["Redis"] },
  { packageName: "redis", skillHints: ["Redis"] },
  { packageName: "firebase", skillHints: ["Firebase"] },
  { packageName: "graphql", skillHints: ["GraphQL"] },
  { packageName: "@apollo/client", skillHints: ["GraphQL", "React"] },
  { packageName: "typescript", skillHints: ["TypeScript"] },
  { packageName: "jest", skillHints: ["Testing"] },
  { packageName: "vitest", skillHints: ["Testing"] },
  { packageName: "mocha", skillHints: ["Testing"] },
];

const PYTHON_MAPPINGS: DependencyMapping[] = [
  { packageName: "fastapi", skillHints: ["FastAPI", "Python"] },
  { packageName: "django", skillHints: ["Django", "Python"] },
  { packageName: "flask", skillHints: ["Flask", "Python"] },
  { packageName: "pandas", skillHints: ["Pandas", "Data / AI"] },
  { packageName: "numpy", skillHints: ["NumPy", "Data / AI"] },
  { packageName: "scikit-learn", skillHints: ["Scikit-learn", "Machine Learning"] },
  { packageName: "sklearn", skillHints: ["Scikit-learn", "Machine Learning"] },
  { packageName: "tensorflow", skillHints: ["TensorFlow", "Deep Learning"] },
  { packageName: "torch", skillHints: ["PyTorch", "Deep Learning"] },
  { packageName: "pytorch", skillHints: ["PyTorch", "Deep Learning"] },
  { packageName: "boto3", skillHints: ["AWS", "Python"] },
  { packageName: "botocore", skillHints: ["AWS"] },
  { packageName: "psycopg2", skillHints: ["PostgreSQL"] },
  { packageName: "asyncpg", skillHints: ["PostgreSQL"] },
  { packageName: "pymongo", skillHints: ["MongoDB"] },
  { packageName: "redis", skillHints: ["Redis"] },
  { packageName: "pytest", skillHints: ["Testing"] },
];

export interface DetectedDependencyEvidence {
  name: string;
  ecosystem: "npm" | "pip" | "maven" | "go" | "cargo" | "other";
  skillHints: string[];
  rawSourceText: string;
}

export function parsePackageJson(content: string): DetectedDependencyEvidence[] {
  try {
    const parsed = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };

    const allDeps = {
      ...(parsed.dependencies || {}),
      ...(parsed.devDependencies || {}),
      ...(parsed.peerDependencies || {}),
    };

    const results: DetectedDependencyEvidence[] = [];
    const seen = new Set<string>();

    for (const [dep, version] of Object.entries(allDeps)) {
      const lower = dep.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);

      const mapping = NPM_MAPPINGS.find(
        (m) => m.packageName === lower || (m.packageName.endsWith("/*") && lower.startsWith(m.packageName.slice(0, -2)))
      );

      const isAws = lower.startsWith("@aws-sdk/") || lower === "aws-sdk";
      const skillHints: string[] = mapping ? [...mapping.skillHints] : [];
      if (isAws && !skillHints.includes("AWS")) {
        skillHints.push("AWS");
      }

      if (skillHints.length > 0) {
        results.push({
          name: dep,
          ecosystem: "npm",
          skillHints,
          rawSourceText: `"${dep}": "${version}"`,
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

export function parsePythonRequirements(content: string): DetectedDependencyEvidence[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  const results: DetectedDependencyEvidence[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const pkgMatch = line.match(/^([A-Za-z0-9_.-]+)/);
    if (!pkgMatch) continue;
    const pkg = pkgMatch[1].toLowerCase();
    if (seen.has(pkg)) continue;
    seen.add(pkg);

    const mapping = PYTHON_MAPPINGS.find((m) => m.packageName === pkg);
    if (mapping) {
      results.push({
        name: pkgMatch[1],
        ecosystem: "pip",
        skillHints: mapping.skillHints,
        rawSourceText: line,
      });
    }
  }

  return results;
}

export function parseGoMod(content: string): DetectedDependencyEvidence[] {
  const lines = content.split(/\r?\n/);
  const results: DetectedDependencyEvidence[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes("github.com/aws/aws-sdk-go")) {
      results.push({
        name: "aws-sdk-go",
        ecosystem: "go",
        skillHints: ["AWS", "Go"],
        rawSourceText: trimmed,
      });
    } else if (trimmed.includes("github.com/gin-gonic/gin")) {
      results.push({
        name: "gin",
        ecosystem: "go",
        skillHints: ["Go"],
        rawSourceText: trimmed,
      });
    }
  }

  return results;
}

export function parseCargoToml(content: string): DetectedDependencyEvidence[] {
  const lines = content.split(/\r?\n/);
  const results: DetectedDependencyEvidence[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("aws-sdk-") || trimmed.startsWith("aws-config")) {
      results.push({
        name: trimmed.split("=")[0].trim(),
        ecosystem: "cargo",
        skillHints: ["AWS", "Rust"],
        rawSourceText: trimmed,
      });
    } else if (trimmed.startsWith("actix-web") || trimmed.startsWith("axum") || trimmed.startsWith("tokio")) {
      results.push({
        name: trimmed.split("=")[0].trim(),
        ecosystem: "cargo",
        skillHints: ["Rust"],
        rawSourceText: trimmed,
      });
    }
  }

  return results;
}
