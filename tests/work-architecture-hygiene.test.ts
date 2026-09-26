import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const srcRoot = join(process.cwd(), "src");

function getSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return getSourceFiles(full);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [full] : [];
  });
}

describe("Shared Work - Architecture & Legacy Hygiene Guards", () => {
  it("ensures legacy operational module dashboard file remains permanently deleted", () => {
    const legacyPath = join(srcRoot, "features/operations/operational-module-dashboard.tsx");
    expect(existsSync(legacyPath)).toBe(false);
  });

  it("ensures legacy project portfolio dashboards presentation file remains permanently deleted", () => {
    const legacyPath = join(srcRoot, "features/projects/portfolio-dashboards.tsx");
    expect(existsSync(legacyPath)).toBe(false);
  });

  it("ensures legacy document center presentation file remains permanently deleted", () => {
    const legacyPath = join(srcRoot, "features/documents/document-center.tsx");
    expect(existsSync(legacyPath)).toBe(false);
  });

  it("ensures no division-specific duplicate work folders exist", () => {
    const forbiddenWorkDirs = [
      join(srcRoot, "modules/hr/work"),
      join(srcRoot, "modules/legal/work"),
      join(srcRoot, "modules/sales/work"),
      join(srcRoot, "modules/property/work"),
      join(srcRoot, "modules/finance/work"),
      join(srcRoot, "modules/it/work"),
    ];

    forbiddenWorkDirs.forEach((dir) => {
      expect(existsSync(dir), `Forbidden duplicate work directory must not exist: ${dir}`).toBe(false);
    });
  });

  it("ensures src/modules/work exists as the single unified shared work implementation", () => {
    expect(existsSync(join(srcRoot, "modules/work"))).toBe(true);
    expect(existsSync(join(srcRoot, "modules/work/projects"))).toBe(true);
    expect(existsSync(join(srcRoot, "modules/work/tasks"))).toBe(true);
    expect(existsSync(join(srcRoot, "modules/work/approvals"))).toBe(true);
    expect(existsSync(join(srcRoot, "modules/work/documents"))).toBe(true);
    expect(existsSync(join(srcRoot, "modules/work/reports"))).toBe(true);
    expect(existsSync(join(srcRoot, "modules/work/findings"))).toBe(true);
  });

  it("ensures production code does not import obsolete presentation components", () => {
    const allFiles = getSourceFiles(srcRoot);
    const forbiddenComponents = /\b(?:ProjectPortfolioDashboard|ProjectPortfolioContent|OperationalModuleDashboard|DocumentCenter)\b/;

    const offenders: string[] = [];
    allFiles.forEach((file) => {
      const content = readFileSync(file, "utf-8");
      if (forbiddenComponents.test(content)) {
        offenders.push(relative(process.cwd(), file));
      }
    });

    expect(offenders).toEqual([]);
  });
});
