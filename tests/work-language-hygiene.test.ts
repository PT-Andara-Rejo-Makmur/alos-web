import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const workDir = join(process.cwd(), "src/modules/work");

function getTsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return getTsxFiles(full);
    return extname(entry.name) === ".tsx" ? [full] : [];
  });
}

describe("Shared Work - Language Hygiene Test", () => {
  const tsxFiles = getTsxFiles(workDir);

  it("found tsx files to inspect in src/modules/work", () => {
    expect(tsxFiles.length).toBeGreaterThan(0);
  });

  const forbiddenUserFacingPatterns: { label: string; pattern: RegExp }[] = [
    { label: "PORTFOLIO OPERATIONS", pattern: /PORTFOLIO\s+OPERATIONS/i },
    { label: ">Tasks<", pattern: />\s*Tasks\s*</ },
    { label: ">Documents<", pattern: />\s*Documents\s*</ },
    { label: "Task Board", pattern: /Task\s+Board/i },
    { label: "To do (user-facing text)", pattern: />\s*To\s+do\s*</i },
    { label: "In progress (user-facing text)", pattern: />\s*In\s+progress\s*</i },
    { label: "In review (user-facing text)", pattern: />\s*In\s+review\s*</i },
  ];

  for (const { label, pattern } of forbiddenUserFacingPatterns) {
    it(`does not contain legacy English copy: "${label}"`, () => {
      const offenders: string[] = [];
      for (const filePath of tsxFiles) {
        const content = readFileSync(filePath, "utf-8");
        if (pattern.test(content)) {
          offenders.push(relative(process.cwd(), filePath));
        }
      }
      expect(offenders, `Forbidden literal "${label}" found in: ${offenders.join(", ")}`).toEqual([]);
    });
  }
});
