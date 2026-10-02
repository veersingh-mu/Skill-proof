export type SkillCategory = "Programming" | "Frontend" | "Backend" | "Database" | "Cloud" | "DevOps" | "Data / AI" | "Tools";

export interface TaxonomySkill {
  canonicalName: string;
  category: SkillCategory;
  aliases: readonly string[];
}

const define = (category: SkillCategory, canonicalName: string, aliases: string[] = []): TaxonomySkill => ({ canonicalName, category, aliases });

export const SKILL_TAXONOMY: readonly TaxonomySkill[] = [
  define("Programming", "Python"), define("Programming", "Java"), define("Programming", "JavaScript", ["JS"]), define("Programming", "TypeScript", ["TS"]), define("Programming", "C"), define("Programming", "C++", ["CPP", "C Plus Plus"]), define("Programming", "Go", ["Golang"]), define("Programming", "Rust"), define("Programming", "PHP"), define("Programming", "Ruby"), define("Programming", "Kotlin"), define("Programming", "Swift"),
  define("Frontend", "HTML"), define("Frontend", "CSS"), define("Frontend", "React", ["React.js", "ReactJS"]), define("Frontend", "Next.js", ["NextJS", "Next JS"]), define("Frontend", "Vue", ["Vue.js", "VueJS"]), define("Frontend", "Angular"), define("Frontend", "Tailwind CSS", ["Tailwind"]),
  define("Backend", "Node.js", ["NodeJS", "Node JS", "Node"]), define("Backend", "Express", ["Express.js", "ExpressJS"]), define("Backend", "FastAPI"), define("Backend", "Django"), define("Backend", "Flask"), define("Backend", "Spring Boot"), define("Backend", "Laravel"),
  define("Database", "PostgreSQL", ["Postgres", "Postgre"]), define("Database", "MySQL"), define("Database", "MongoDB", ["Mongo", "Mongo DB"]), define("Database", "Redis"), define("Database", "SQLite"),
  define("Cloud", "AWS", ["AWS Cloud", "Amazon Web Services"]), define("Cloud", "Azure", ["Microsoft Azure"]), define("Cloud", "Google Cloud", ["GCP", "Google Cloud Platform"]), define("Cloud", "Firebase"),
  define("DevOps", "Docker"), define("DevOps", "Kubernetes", ["K8s"]), define("DevOps", "GitHub Actions", ["Github Actions"]), define("DevOps", "Jenkins"), define("DevOps", "Terraform"), define("DevOps", "CI/CD", ["CI CD", "Continuous Integration", "Continuous Delivery"]),
  define("Data / AI", "Pandas"), define("Data / AI", "NumPy", ["Numpy"]), define("Data / AI", "Scikit-learn", ["Scikit Learn", "Sklearn"]), define("Data / AI", "TensorFlow"), define("Data / AI", "PyTorch"), define("Data / AI", "Machine Learning", ["ML"]), define("Data / AI", "Deep Learning"),
  define("Tools", "Git"), define("Tools", "GitHub", ["Github"]), define("Tools", "GitLab"), define("Tools", "REST API", ["RESTful API", "REST APIs"]), define("Tools", "GraphQL"),
];

export const SKILL_NAMES = SKILL_TAXONOMY.map((skill) => skill.canonicalName);
