import { describe, expect, it } from "vitest";

import { navigationItems } from "@/components/layout/navigation";
import { experiences, getExperience } from "@/experiences/registry";

describe("experience registry", () => {
  it("menyediakan seluruh route wajib tanpa duplikasi", () => {
    expect(experiences.map((experience) => experience.href)).toEqual([
      "/business",
      "/ara",
      "/genesis",
      "/agents",
      "/research",
      "/governance",
      "/director",
      "/giivepro",
    ]);
    expect(new Set(experiences.map((experience) => experience.id)).size).toBe(8);
    expect(navigationItems.map((item) => item.href)).toEqual(
      experiences.map((experience) => experience.href),
    );
  });

  it("memisahkan Director dari technical control-plane audience", () => {
    expect(getExperience("director").audience).toBe("EXECUTIVE DECISION");
    expect(getExperience("genesis").audience).toBe("IT ASSURANCE");
  });

  it("menggunakan satu route untuk satu shared R&D workspace", () => {
    expect(experiences.filter((experience) => experience.id === "research")).toHaveLength(1);
    expect(getExperience("research").href).toBe("/research");
  });
});
