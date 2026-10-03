import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainOverview } from "@/features/business-records/overview";
import { legalResources } from "@/features/legal/resources";
import { hrResources } from "@/features/hr/resources";
import { itResources } from "@/features/it/resources";
import { ApiRequestError } from "@/lib/api";

afterEach(cleanup);
const resources = { legal: legalResources, hr: hrResources, it: itResources };

describe.each(["legal", "hr", "it"] as const)("canonical %s operations", (domain) => {
  it("presents every accepted field and excludes unavailable mutation contracts", () => {
    const schema = JSON.parse(readFileSync(resolve(`../alos-contracts/schemas/${domain}/${domain}-contracts.schema.json`), "utf8")) as {
      $defs: Record<string, { properties?: Record<string, unknown>; required?: readonly string[] }>;
    };
    for (const resource of Object.values(resources[domain])) {
      const projection = Object.entries(schema.$defs).find(([name, value]) => name.endsWith("Projection") && !name.endsWith("ListProjection") && value.properties?.[resource.identifier]
        && !schema.$defs[`${name.replace(/Projection$/, "")}CreateRequest`]?.properties?.[resource.identifier]);
      expect(projection).toBeDefined();
      const name = projection![0].replace(/Projection$/, "");
      expect(resource.createFields.map((field) => field.name).sort()).toEqual(Object.keys(schema.$defs[`${name}CreateRequest`].properties!).sort());
      expect(resource.updateFields.map((field) => field.name).sort()).toEqual(Object.keys(schema.$defs[`${name}UpdateRequest`]?.properties ?? {}).sort());
      expect(resource.columns.map((field) => field.name).sort()).toEqual(Object.keys(projection![1].properties!).filter((field) => field !== "allowed_transitions").sort());
      for (const field of resource.createFields) {
        expect(field.required).toBe((schema.$defs[`${name}CreateRequest`].required ?? []).includes(field.name));
        expect(["tenant_id", "organization_id", "workspace_id", "actor_id", "approved_by", "approved_at", "owner_actor_id", "decided_by", "verified_by", "released_at"]).not.toContain(field.name);
      }
      if (resource.immutable) expect(resource.updateFields).toEqual([]);
    }
  });

  it("keeps operational source failures distinct from empty counts", async () => {
    const read = vi.fn().mockRejectedValue(new Error("recorded source failure"));
    render(<DomainOverview title={domain} read={read} labels={{ records: "Rekaman" }} unavailable={[]} />);
    expect(await screen.findByText("Gagal Memuat")).toBeInTheDocument();
    expect(screen.queryByText("Jumlah Tersimpan")).not.toBeInTheDocument();
    expect(screen.queryByText("Belum ada data")).not.toBeInTheDocument();
  });

  it("shows unavailable contracts without substituting zero", async () => {
    const read = vi.fn().mockRejectedValue(new ApiRequestError("Unavailable", 503, "test", "CONTRACTS_UNAVAILABLE"));
    render(<DomainOverview title={domain} read={read} labels={{ records: "Rekaman" }} unavailable={[]} />);
    expect(await screen.findByText("Belum Tersedia")).toBeInTheDocument();
    expect(screen.queryByText("Jumlah Tersimpan")).not.toBeInTheDocument();
  });
});
