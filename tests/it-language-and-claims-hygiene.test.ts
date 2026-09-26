import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";

const IT_SOURCE_ROOT = join(process.cwd(), "src", "modules", "it");

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

const source = collectSourceFiles(IT_SOURCE_ROOT)
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

describe("higiene bahasa dan klaim UI IT", () => {
  it.each([
    '"No backend',
    '"Module Readiness"',
    '"Change History"',
    '"Access Review"',
  ])("tidak memuat literal user-facing Inggris lama: %s", (legacyLiteral) => {
    expect(source).not.toContain(legacyLiteral);
  });

  it.each([
    "cryptographically anchored",
    "cryptographic audit evidence ledger",
    "governance committee sign-off",
    "backend governance ledger",
    "internal gateway proxies",
  ])("tidak memuat klaim mekanisme yang belum didukung: %s", (unsupportedClaim) => {
    expect(source.toLowerCase()).not.toContain(unsupportedClaim);
  });

  it("tidak memuat ikon Unicode atau SVG manual", () => {
    expect(source).not.toMatch(/[×✕＋]/u);
    expect(source).not.toMatch(/<(?:svg|path|circle|polygon|rect)(?:\s|>)/i);
  });
});
