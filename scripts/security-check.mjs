import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export function verifyBracesMitigation() {
  const root = createRequire(import.meta.url);
  const eslint = createRequire(root.resolve("eslint-config-next"));
  const plugin = createRequire(eslint.resolve("@next/eslint-plugin-next"));
  const glob = createRequire(plugin.resolve("fast-glob"));
  const micromatch = createRequire(glob.resolve("micromatch"));
  const braces = micromatch("braces");
  const nested = "{".repeat(4000) + "a,b" + "}".repeat(4000);
  for (const operation of [braces.parse, braces.compile, braces.expand]) {
    assert.throws(() => operation(nested), /Brace nesting exceeds safe depth 128/);
  }
  // Public AST entry points must be bounded even when callers bypass the parser.
  let ast = { type: "root", nodes: [{ type: "text", value: "x" }] };
  for (let index = 0; index < 5000; index++) ast = { type: "root", nodes: [ast] };
  assert.throws(() => braces.compile(ast), /Brace nesting exceeds safe depth 128/);
  assert.throws(() => braces.stringify(ast), /Brace nesting exceeds safe depth 128/);
  assert.deepEqual(braces.expand("src/{app,features}/**/*.{ts,tsx}"), [
    "src/app/**/*.ts", "src/app/**/*.tsx", "src/features/**/*.ts", "src/features/**/*.tsx",
  ]);
  assert.deepEqual(braces.expand("{a,{b,c}}"), ["a", "b", "c"]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyBracesMitigation();
  const result = spawnSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["audit", "--json"], {
    encoding: "utf8", shell: process.platform === "win32", timeout: 120_000,
  });
  if (result.error) throw result.error;
  const report = JSON.parse(result.stdout);
  if (report.error || !report.metadata?.vulnerabilities) throw new Error("Dependency audit unavailable");
  const advisories = Object.values(report.advisories ?? {});
  const mitigationId = "GHSA-vfj7-8cjw-p6xm";
  const mitigated = advisories.filter(item => item.github_advisory_id === mitigationId
    && item.module_name === "braces" && item.findings?.length
    && item.findings.every(finding => finding.version === "3.0.3" && finding.dev === true));
  const unmitigated = advisories.filter(item => !mitigated.includes(item));
  console.log(JSON.stringify({
    reported_advisories: advisories.length,
    locally_mitigated_advisories: mitigated.map(item => item.github_advisory_id),
    unmitigated_advisories: unmitigated.map(item => item.github_advisory_id),
  }, null, 2));
  if (unmitigated.length || (result.status !== 0 && !advisories.length)) process.exitCode = 1;
}
