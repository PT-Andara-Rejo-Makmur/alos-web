import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

import * as api from "@/lib/api";

const realAuthenticatedApiRequest = api.authenticatedApiRequest;

const workspaceFixtures = [
  ["ws_finance_holding", "finance", "FINANCE"], ["ws_finance_01", "finance", "FINANCE"],
  ["ws_finance_02", "finance", "FINANCE"], ["ws_finance_test", "finance", "FINANCE"],
  ["ws_fin_01", "finance", "FINANCE"], ["ws_fin", "finance", "FINANCE"],
  ["ws_hr_01", "hr", "HR"], ["ws_hr_director", "hr", "HR"], ["ws_hr_holding", "hr", "HR"], ["ws_hr", "hr", "HR"],
  ["ws_it_01", "it", "IT"], ["ws_legal_01", "legal", "LEGAL"], ["ws_legal", "legal", "LEGAL"],
  ["ws_sales_01", "sales", "SALES"], ["ws_sales_director", "sales", "SALES"], ["ws_property_01", "property", "PROPERTY"],
  ["ws_property_park_town", "property", "PROPERTY"], ["ws_property_other", "property", "PROPERTY"], ["ws_prop", "property", "PROPERTY"],
  ["ws_prop_01", "property", "PROPERTY"], ["ws_1", "finance", "FINANCE"], ["ws_2", "property", "PROPERTY"],
  ["ws_exec_01", "executive", "EXEC"], ["ws_executive_01", "executive", "EXEC"],
] as const;

beforeEach(() => {
  vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path: string, options = {}) => {
    if (path === "/api/v1/workspaces") {
      return workspaceFixtures.map(([workspace_id, workspace_key, division_code]) => ({
        workspace_id, workspace_key, division_code,
        name: workspace_key === "legal" ? "Legal Workspace" : `${division_code} Workspace`,
        access_level: "MEMBER",
      })) as never;
    }
    return realAuthenticatedApiRequest(path, options) as never;
  });
});
