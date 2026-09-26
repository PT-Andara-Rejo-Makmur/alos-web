import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = join(process.cwd(), "src");
const productionExtensions = new Set([".ts", ".tsx", ".css"]);

function productionFiles(directory = sourceRoot): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return productionFiles(path);
    return productionExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function violations(pattern: RegExp): string[] {
  return productionFiles().flatMap((path) => {
    const content = readFileSync(path, "utf8");
    return pattern.test(content) ? [relative(process.cwd(), path)] : [];
  });
}

describe("production architecture hygiene", () => {
  it("rejects retired milestone namespaces and symbols", () => {
    expect(violations(/mvp1/i)).toEqual([]);
  });

  it("rejects array-order authority and fake authority fallbacks", () => {
    expect(
      violations(
        /workspace_ids\s*\?*\.?\s*\[0\]|division_codes\s*\?*\.?\s*\[0\]|DEFAULT_FALLBACK_ACTOR|FALLBACK_WORKSPACE|org_andara_holding|ws_(?:finance|property|sales)_holding/,
      ),
    ).toEqual([]);
  });

  it("rejects obsolete authorization role vocabulary", () => {
    expect(
      violations(/\b(?:DIRECTOR|DIVISION_OWNER|DIVISION_LEAD|DIVISION_MEMBER|IT_LEAD|QA_SECURITY)\b/),
    ).toEqual([]);
  });

  it("keeps protected browser authentication behind the session boundary", () => {
    const offenders = productionFiles().filter((path) => {
      const content = readFileSync(path, "utf8");
      return content.includes('"use client"') && /api\/v1\/(?:auth\/)?whoami/.test(content);
    });
    expect(offenders.map((path) => relative(process.cwd(), path))).toEqual([]);
  });

  it("rejects unscoped global workspace links in internal production code", () => {
    const forbiddenLinkPatterns = [
      /["']\/workspace\/ara["']/,
      /["']\/workspace\/agents["']/,
      /["']\/workspace\/projects["']/,
      /["']\/workspace\/tasks["']/,
      /["']\/workspace\/approvals["']/,
      /["']\/workspace\/documents["']/,
      /["']\/workspace\/reports["']/,
      /["']\/workspace\/findings["']/,
    ];

    const allowedFiles = new Set([
      "src/features/workspace-routing/compatibility-routes.ts",
      "src/features/ara-workspace/ara-route-adapter.ts",
      "src/app/workspace/ara/page.tsx",
      "src/app/workspace/agents/page.tsx",
      "src/app/workspace/projects/page.tsx",
      "src/app/workspace/tasks/page.tsx",
      "src/app/workspace/approvals/page.tsx",
      "src/app/workspace/documents/page.tsx",
      "src/app/workspace/reports/page.tsx",
      "src/app/workspace/findings/page.tsx",
    ]);

    const offenders = productionFiles().flatMap((path) => {
      const relPath = relative(process.cwd(), path).replaceAll("\\", "/");
      if (allowedFiles.has(relPath)) return [];
      const content = readFileSync(path, "utf8");
      return forbiddenLinkPatterns.some((pattern) => pattern.test(content)) ? [relPath] : [];
    });

    expect(offenders).toEqual([]);
  });

  it("rejects ghost canonical route links in internal production code", () => {
    const ghostRoutePatterns = [
      /["']\/workspace\/[a-zA-Z0-9_-]+\/overview["']/,
      /["']\/workspace\/it\/agents["']/,
      /["']\/workspace\/it\/register-user["']/,
      /["']\/workspace\/it\/genesis\/models(?![a-zA-Z0-9_-])["']/,
      /["']\/workspace\/property\/payment-certs(?![a-zA-Z0-9_-])["']/,
    ];

    const offenders = productionFiles().flatMap((path) => {
      const relPath = relative(process.cwd(), path).replaceAll("\\", "/");
      const content = readFileSync(path, "utf8");
      return ghostRoutePatterns.some((pattern) => pattern.test(content)) ? [relPath] : [];
    });

    expect(offenders).toEqual([]);
  });

  it("rejects direct IT governance route links in non-IT workspace navigation configuration", () => {
    const navFilePath = join(sourceRoot, "features/workspace-shell/workspace-navigation.ts");
    const content = readFileSync(navFilePath, "utf8");

    // Verify Executive and Finance blocks don't contain getGovernanceRoute or direct /workspace/it/governance
    const executiveMatch = content.match(/if\s*\(\s*isExecutive\s*\)\s*\{([\s\S]*?)(?:return|if)/);
    const financeMatch = content.match(/if\s*\(\s*isFinance\s*\)\s*\{([\s\S]*?)(?:return|if)/);

    expect(executiveMatch?.[1] || "").not.toMatch(/getGovernanceRoute|\/workspace\/it\/governance/);
    expect(financeMatch?.[1] || "").not.toMatch(/getGovernanceRoute|\/workspace\/it\/governance/);
  });
});

