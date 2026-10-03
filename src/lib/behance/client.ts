/**
 * Behance Provider Abstraction.
 *
 * Separates the BehanceProvider INTERFACE from IMPLEMENTATION.
 * This allows the implementation to change (e.g., when an authorized API becomes
 * available) without affecting the Evidence Engine.
 *
 * IMPORTANT: Adobe deprecated the Behance public API.
 * There is NO officially supported public API or authorized access mechanism.
 * The DemoBehanceProvider provides deterministic fixture data for development/testing.
 * Production should show "Behance analysis unavailable" unless an authorized
 * integration is configured.
 */

import "server-only";
import type { BehanceProfile, BehanceProject } from "@/types/behance";

export class BehanceProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "BEHANCE_PROFILE_NOT_FOUND"
      | "BEHANCE_ACCESS_UNAVAILABLE"
      | "BEHANCE_PROVIDER_ERROR"
      | "NO_PUBLIC_PROJECTS"
      | "PROJECT_ANALYSIS_FAILED"
      | "RATE_LIMITED"
      | "TIMEOUT"
  ) {
    super(message);
    this.name = "BehanceProviderError";
  }
}

/**
 * Abstract Behance provider interface.
 * Any implementation must return data in this shape.
 */
export interface IBehanceProvider {
  /** Whether this provider can actually connect to Behance */
  readonly isAvailable: boolean;

  /** Fetch profile information for a username */
  getProfile(username: string): Promise<BehanceProfile>;

  /** Fetch public projects for a username */
  getProjects(username: string, limit?: number): Promise<BehanceProject[]>;
}

/**
 * Demo/fixture provider for development and testing.
 * Returns deterministic data so the full pipeline can be exercised without live API access.
 * Clearly marked as non-production data.
 */
export class DemoBehanceProvider implements IBehanceProvider {
  readonly isAvailable = true;

  async getProfile(username: string): Promise<BehanceProfile> {
    return {
      username,
      displayName: `${username} (Demo)`,
      profileUrl: `https://www.behance.net/${username}`,
      projectCount: DEMO_PROJECTS.length,
    };
  }

  async getProjects(username: string, limit = 15): Promise<BehanceProject[]> {
    return DEMO_PROJECTS.slice(0, limit).map((p) => ({
      ...p,
      url: `https://www.behance.net/gallery/${p.id}/${p.title.toLowerCase().replace(/\s+/g, "-")}`,
    }));
  }
}

/**
 * Production Behance provider stub.
 * Marks itself as unavailable since no authorized API access mechanism exists.
 * When an official integration becomes available, implement the methods here.
 */
export class LiveBehanceProvider implements IBehanceProvider {
  readonly isAvailable = false;

  async getProfile(_username: string): Promise<BehanceProfile> {
    void _username;
    throw new BehanceProviderError(
      "Behance live analysis is not currently available. Adobe deprecated the public Behance API. " +
      "An authorized integration is required for production use.",
      "BEHANCE_ACCESS_UNAVAILABLE"
    );
  }

  async getProjects(_username: string, _limit?: number): Promise<BehanceProject[]> {
    void _username;
    void _limit;
    throw new BehanceProviderError(
      "Behance live analysis is not currently available.",
      "BEHANCE_ACCESS_UNAVAILABLE"
    );
  }
}

/**
 * Returns the active Behance provider based on environment configuration.
 * Uses demo provider when BEHANCE_DEMO_MODE is set (default for development).
 */
export function createBehanceProvider(): IBehanceProvider {
  const demoMode = process.env.BEHANCE_DEMO_MODE !== "false";
  if (demoMode) {
    return new DemoBehanceProvider();
  }
  return new LiveBehanceProvider();
}

// ---------------------------------------------------------------------------
// Demo fixture data — representative creative projects for testing
// ---------------------------------------------------------------------------

const DEMO_PROJECTS: BehanceProject[] = [
  {
    id: "180001",
    title: "Fintech Brand Identity",
    url: "",
    description: "Complete brand identity system for a fintech startup including logo design, typography system, color palette, and marketing collateral. Created using Adobe Illustrator and Photoshop.",
    categories: ["Branding", "Graphic Design"],
    tags: ["brand identity", "logo", "typography", "color system", "fintech", "illustrator", "photoshop"],
    publishedAt: "2026-06-15T00:00:00Z",
    modifiedAt: "2026-06-20T00:00:00Z",
    mediaCount: 12,
    coverImageUrl: null,
  },
  {
    id: "180002",
    title: "Mobile Banking App UI",
    url: "",
    description: "UI/UX design for a mobile banking application with dashboard, transaction flows, and onboarding screens. Designed in Figma with a comprehensive design system.",
    categories: ["UI/UX", "Interaction Design"],
    tags: ["ui design", "mobile app", "dashboard", "figma", "design system", "banking"],
    publishedAt: "2026-05-10T00:00:00Z",
    modifiedAt: "2026-05-22T00:00:00Z",
    mediaCount: 18,
    coverImageUrl: null,
  },
  {
    id: "180003",
    title: "Organic Tea Packaging",
    url: "",
    description: "Packaging design for an organic tea brand. Includes box design, label design, and product photography staging. Adobe Photoshop and Illustrator.",
    categories: ["Packaging", "Graphic Design"],
    tags: ["packaging", "label design", "product design", "organic", "photoshop", "illustrator"],
    publishedAt: "2026-04-01T00:00:00Z",
    modifiedAt: "2026-04-10T00:00:00Z",
    mediaCount: 8,
    coverImageUrl: null,
  },
  {
    id: "180004",
    title: "Typography Exploration Series",
    url: "",
    description: "Experimental typography project exploring type design, lettering, and typographic compositions. A study in visual hierarchy and readability.",
    categories: ["Typography", "Graphic Design"],
    tags: ["typography", "lettering", "type design", "typographic", "visual hierarchy"],
    publishedAt: "2026-03-15T00:00:00Z",
    modifiedAt: "2026-03-18T00:00:00Z",
    mediaCount: 10,
    coverImageUrl: null,
  },
  {
    id: "180005",
    title: "Poster Collection 2026",
    url: "",
    description: "Collection of poster designs for cultural events. Graphic design with bold typography and vibrant color palettes. Created in Adobe Photoshop.",
    categories: ["Graphic Design"],
    tags: ["poster", "graphic design", "print design", "photoshop", "visual design"],
    publishedAt: "2026-02-20T00:00:00Z",
    modifiedAt: "2026-02-25T00:00:00Z",
    mediaCount: 6,
    coverImageUrl: null,
  },
  {
    id: "180006",
    title: "Product Launch Motion Graphics",
    url: "",
    description: "Motion graphics and animation for a product launch campaign. Kinetic typography and product reveal animations created in After Effects.",
    categories: ["Motion Graphics"],
    tags: ["motion graphics", "animation", "after effects", "kinetic typography", "product launch"],
    publishedAt: "2026-01-10T00:00:00Z",
    modifiedAt: "2026-01-15T00:00:00Z",
    mediaCount: 3,
    coverImageUrl: null,
  },
];
