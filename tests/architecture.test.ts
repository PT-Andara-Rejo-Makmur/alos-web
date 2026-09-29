import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const sourceRoot = join(root, "src");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("frontend architecture boundary", () => {
  it("memusatkan seluruh fetch pada src/lib/api", () => {
    const violations = sourceFiles(sourceRoot)
      .filter((path) => readFileSync(path, "utf8").includes("fetch("))
      .map((path) => relative(root, path).replaceAll("\\", "/"))
      .filter((path) => !path.startsWith("src/lib/api/"));

    expect(violations).toEqual([]);
  });

  it("tidak memuat provider SDK atau direct GENESIS endpoint", () => {
    const forbidden = [
      /https?:\/\/[^"'\s]*genesis/i,
      /NEXT_PUBLIC_GENESIS/i,
      /["']\/internal\/v1\//,
      /from\s+["'](?:openai|@google\/generative-ai|@anthropic-ai\/sdk)["']/,
    ];
    const violations = sourceFiles(sourceRoot).flatMap((path) => {
      const content = readFileSync(path, "utf8");
      return forbidden.some((pattern) => pattern.test(content))
        ? [relative(root, path).replaceAll("\\", "/")]
        : [];
    });

    expect(violations).toEqual([]);
  });

  it("menyediakan route utama dalam satu Next.js application", () => {
    for (const route of [
      "login",
      "workspace",
      join("workspace", "executive"),
      join("workspace", "sales"),
      join("workspace", "[workspaceKey]"),
      join("workspace", "[workspaceKey]", "(domain)", "summary"),
      join("workspace", "[workspaceKey]", "(domain)", "brief"),
      join("workspace", "[workspaceKey]", "(domain)", "planning"),
      join("workspace", "[workspaceKey]", "(domain)", "performance"),
      join("workspace", "[workspaceKey]", "(domain)", "initiatives"),
      join("workspace", "[workspaceKey]", "(domain)", "reviews"),
      join("workspace", "[workspaceKey]", "(domain)", "divisions"),
      join("workspace", "[workspaceKey]", "(assistant)", "ara"),
      join("workspace", "[workspaceKey]", "(shared-work)", "projects"),
      join("workspace", "[workspaceKey]", "(shared-work)", "tasks"),
      join("workspace", "[workspaceKey]", "(shared-work)", "approvals"),
      join("workspace", "[workspaceKey]", "(shared-work)", "documents"),
      join("workspace", "[workspaceKey]", "(shared-work)", "reports"),
      join("workspace", "[workspaceKey]", "(shared-work)", "findings"),
    ]) {
      expect(() => readFileSync(join(sourceRoot, "app", route, "page.tsx"), "utf8")).not.toThrow();
    }
  });

  it("keeps desktop sidebar bound to the viewport with internal navigation scroll", () => {
    const shellCss = readFileSync(join(sourceRoot, "components", "app-shell", "app-shell.module.css"), "utf8");
    expect(shellCss).toMatch(/height:\s*100dvh/);
    expect(shellCss).toMatch(/position:\s*sticky/);
    expect(shellCss).toMatch(/top:\s*0/);
    expect(shellCss).toMatch(/\.navigation\s*\{[\s\S]*overflow-y:\s*auto/);
  });

  it("tidak mendeklarasikan public secret environment", () => {
    const environmentExample = readFileSync(join(root, ".env.example"), "utf8");
    expect(environmentExample).not.toMatch(/NEXT_PUBLIC_.*(?:KEY|SECRET|TOKEN)/i);
  });
});
