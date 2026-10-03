/**
 * Behance Provider Library — Public API barrel.
 */

export { analyzeBehanceUser, type AnalyzeBehanceOptions } from "./analyzer";
export { createBehanceProvider, DemoBehanceProvider, LiveBehanceProvider, BehanceProviderError, type IBehanceProvider } from "./client";
export { parseBehanceProfileUrl, parseBehanceProjectUrl, isBehanceProfileUrl, BehanceUrlError } from "./parse-url";
export { BEHANCE_CONFIG } from "./config";
export { diffBehanceEvidence, getEvidenceKey, type BehanceEvidenceDiff, type EvidenceDiffSummary } from "./diff";
