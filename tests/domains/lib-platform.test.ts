import { describe, expect, it } from "vitest";

import { divisionCodes, genesisIsSystemActor } from "@/features/access-control/platform";

describe("Genesis initial product platform boundary", () => {
  it("keeps exactly six division contexts", () => {
    expect(divisionCodes).toHaveLength(6);
    expect(divisionCodes).not.toContain("AI_EXECUTIVE");
  });

  it("treats Genesis as a system actor", () => {
    expect(genesisIsSystemActor).toBe(true);
  });
});
