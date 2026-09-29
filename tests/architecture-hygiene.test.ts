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

  it("rejects retired authorization role vocabulary while allowing the MVP-2 target vocabulary", () => {
    expect(
      violations(/\b(?:DIRECTOR|DIVISION_OWNER|IT_LEAD|QA_SECURITY)\b/),
    ).toEqual([]);
  });

  it("keeps protected browser authentication behind the session boundary", () => {
    const offenders = productionFiles().filter((path) => {
      const content = readFileSync(path, "utf8");
      return content.includes('"use client"') && /api\/v1\/(?:auth\/)?whoami/.test(content);
    });
    expect(offenders.map((path) => relative(process.cwd(), path))).toEqual([]);
  });

  it("rejects role-based permission synthesis in shared-work", () => {
    const sharedWorkFiles = productionFiles(join(sourceRoot, "features", "shared-work"));
    const offenders = sharedWorkFiles.filter((path) => {
      const content = readFileSync(path, "utf8");
      return (
        /role(?:_refs)?(?:\.includes|\s*===)\s*\(?["'](?:WORKSPACE_LEAD|WORKSPACE_MEMBER|ORG_ADMIN)/.test(content) &&
        /project\.create|task\.create|approval\./.test(content)
      );
    });
    expect(offenders.map((path) => relative(process.cwd(), path))).toEqual([]);
  });

  it("uses semantic Executive feature names without delivery namespaces", () => {
    const executiveRoot = join(sourceRoot, "features", "executive");
    const offenders = productionFiles(executiveRoot).filter((path) => /(?:mvp|stage|phase|golden|prototype)/i.test(relative(executiveRoot, path)));
    expect(offenders.map((path) => relative(process.cwd(), path))).toEqual([]);
  });

  it("does not synthesize an Executive title or refresh action", () => {
    const executiveFiles = productionFiles(join(sourceRoot, "features", "executive"));
    const content = executiveFiles.map((path) => readFileSync(path, "utf8")).join("\n");
    expect(content).not.toMatch(/Direktur Utama|Direktur|\bCEO\b|Segarkan Data|Refresh Data/);
  });
});
