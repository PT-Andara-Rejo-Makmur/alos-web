import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useExecutiveOverview } from "@/features/executive/executive-data";
import type { ExecutiveOverviewProjection } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";

import { executiveOverviewFixture } from "./executive-overview-fixture";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("aborts an old workspace overview and never renders its late response", async () => {
  let resolveOld!: (value: ExecutiveOverviewProjection) => void;
  let oldSignal: AbortSignal | undefined;
  const next = { ...executiveOverviewFixture(), workspace_id: "workspace_next" };
  vi.spyOn(strategyApi, "getExecutiveOverview")
    .mockImplementationOnce((signal) => {
      oldSignal = signal;
      return new Promise((resolve) => { resolveOld = resolve; });
    })
    .mockResolvedValueOnce(next);
  const { result, rerender } = renderHook(({ workspace }) => useExecutiveOverview(workspace), {
    initialProps: { workspace: "old" },
  });
  expect(result.current.loading).toBe(true);
  rerender({ workspace: "next" });
  expect(oldSignal?.aborted).toBe(true);
  expect(result.current.data).toBeNull();
  await waitFor(() => expect(result.current.data?.workspace_id).toBe("workspace_next"));
  await act(async () => { resolveOld({ ...executiveOverviewFixture(), workspace_id: "workspace_old" }); });
  expect(result.current.data?.workspace_id).toBe("workspace_next");
});
