import { describe, expect, it } from "vitest";

import { experiences, getExperience } from "@/experiences/registry";

describe("experience registry", () => {
  it("menyediakan seluruh route wajib tanpa duplikasi", () => {
    expect(experiences.map((experience) => experience.href)).toEqual([
      "/business",
      "/ara",
      "/genesis",
      "/director",
      "/giivepro",
    ]);
    expect(new Set(experiences.map((experience) => experience.id)).size).toBe(5);
  });

  it("memisahkan Director dari technical control-plane audience", () => {
    expect(getExperience("director").audience).toBe("EXECUTIVE DECISION");
    expect(getExperience("genesis").audience).toBe("IT ASSURANCE");
  });
});
