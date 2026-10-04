import { it } from "vitest";
// This executes the actual transitive package used by the Next ESLint plugin.
// @ts-expect-error JavaScript security checker has no declaration file.
import { verifyBracesMitigation } from "../scripts/security-check.mjs";

it("bounds malicious nesting while preserving the workspace glob patterns", () => {
  verifyBracesMitigation();
});
