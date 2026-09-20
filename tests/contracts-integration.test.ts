import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTRACT_SOURCE,
  type ContextBundle,
  type DataClassification,
  type EvidenceBundle,
  type EvidenceRef,
  type FreshnessStatus,
  type ResearchDecision,
  type SourceType,
} from "@/lib/contracts";

const root = process.cwd();
const sourceRoot = join(root, "src");

function getSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return getSourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("Canonical Contract & Architecture Boundary Integration", () => {
  it("mengekspor contract types kanonikal dari alos-contracts", () => {
    expect(CONTRACT_SOURCE).toBe("alos-contracts/generated/typescript");

    // Type-level contract validation using deterministic fixtures matching context-research.ts
    const evidenceRef: EvidenceRef = {
      evidence_id: "evi_canonical_01",
      source_id: "SRC_CANONICAL_01",
      uri: "https://backend.alos.test/vault/doc1",
      captured_at: "2026-09-19T10:00:00Z",
      content_hash: "hash_canonical_abc",
      source_type: "INTERNAL" as SourceType,
      freshness: "CURRENT" as FreshnessStatus,
      data_classification: "INTERNAL" as DataClassification,
      instruction_authority: false,
    };

    expect(evidenceRef.evidence_id).toBe("evi_canonical_01");
    expect(evidenceRef.instruction_authority).toBe(false);

    const evidenceBundle: EvidenceBundle = {
      bundle_id: "bnd_01",
      tenant_id: "tenant_default",
      organization_id: "org_default",
      workspace_id: "workspace_default",
      run_id: "run_01",
      correlation_id: "corr_bnd_01",
      evidence_refs: [evidenceRef],
    };

    expect(evidenceBundle.evidence_refs).toHaveLength(1);

    const contextBundle: ContextBundle = {
      context_id: "ctx_bnd_01",
      tenant_id: "tenant_default",
      organization_id: "org_default",
      workspace_id: "workspace_default",
      actor_id: "actor_default",
      correlation_id: "corr_ctx_01",
      created_at: "2026-09-19T10:00:00Z",
      scope_refs: ["scope.research"],
      items: [
        {
          key: "k1",
          value: "v1",
          source_id: "SRC_CANONICAL_01",
          evidence_id: "evi_canonical_01",
          source_version: "1.0",
          content_hash: "hash_canonical_abc",
          anchor: "anchor_1",
          data_classification: "INTERNAL",
          instruction_authority: false,
        },
      ],
      evidence_refs: [evidenceRef],
    };

    expect(contextBundle.items).toHaveLength(1);

    const researchDecision: ResearchDecision = {
      correlation_id: "corr_res_01",
      decision: "USE_INTERNAL_SOURCE",
      domain: "TECHNOLOGY",
      selected_evidence_ids: ["evi_canonical_01"],
      reasons: ["Sufficient internal documentation found."],
      external_content_trust: "UNTRUSTED",
    };

    expect(researchDecision.external_content_trust).toBe("UNTRUSTED");
  });

  it("memverifikasi TIDAK ADA direct HTTP request dari Web ke GENESIS di seluruh source code", () => {
    const files = getSourceFiles(sourceRoot);
    const violations = files.flatMap((path) => {
      const content = readFileSync(path, "utf8");
      // Check for direct GENESIS URLs, NEXT_PUBLIC_GENESIS, internal endpoints, or LLM direct client imports
      const directGenesisPatterns = [
        /https?:\/\/[^"'\s]*genesis(?::\d+)?\//i,
        /NEXT_PUBLIC_GENESIS/i,
        /["']\/internal\/v1\//,
        /from\s+["'](?:openai|@google\/generative-ai|@anthropic-ai\/sdk)["']/,
      ];

      return directGenesisPatterns.some((pattern) => pattern.test(content))
        ? [relative(root, path).replaceAll("\\", "/")]
        : [];
    });

    expect(violations).toEqual([]);
  });

  it("memverifikasi seluruh fetch tetap terpusat pada src/lib/api", () => {
    const files = getSourceFiles(sourceRoot);
    const fetchViolations = files
      .filter((path) => readFileSync(path, "utf8").includes("fetch("))
      .map((path) => relative(root, path).replaceAll("\\", "/"))
      .filter((path) => !path.startsWith("src/lib/api/"));

    expect(fetchViolations).toEqual([]);
  });

  it("tidak menghitung research authority dari raw actor scope di frontend", () => {
    const researchRoot = join(sourceRoot, "features", "research");
    const violations = getSourceFiles(researchRoot).flatMap((path) => {
      const content = readFileSync(path, "utf8");
      return [/\/api\/v1\/auth\/whoami/, /evaluateBackendDomainPermissions/].some(
        (pattern) => pattern.test(content),
      )
        ? [relative(root, path).replaceAll("\\", "/")]
        : [];
    });

    expect(violations).toEqual([]);
  });
});
