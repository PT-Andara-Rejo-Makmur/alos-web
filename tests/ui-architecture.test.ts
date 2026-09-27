import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const uiRoot = join(process.cwd(), "src", "components", "ui");

function implementationFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return implementationFiles(path);
    return statSync(path).isFile() && /\.(ts|tsx|css)$/.test(entry.name) ? [path] : [];
  });
}

describe("shared UI architecture", () => {
  it("does not depend on application authority or business modules", () => {
    const source = implementationFiles(uiRoot).map((path) => readFileSync(path, "utf8")).join("\n");
    expect(source).not.toMatch(/@\/lib\/api|@\/features\/session|@\/modules\/strategy/);
    expect(source).not.toMatch(/\bfinance\b|\bsales\b|\bproperty\b|\blegal\b|\bhr\b|\bexecutive\b|\bgenesis\b|\bara\b/i);
    expect(source).not.toMatch(/\b(fetch|authenticatedApiRequest|sessionApiRequest)\s*\(/);
  });
});
