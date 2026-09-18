import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearKillSwitch,
  deleteAgentDraft,
  killAgent,
  mapRuntimeStatus,
  retireAgent,
  rollbackAgent,
  updateAgentDraft,
} from "@/features/mvp1/lib/governance-actions";

describe("Governance Actions Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_ALOS_API_BASE_URL = "https://backend.alos.test";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("mapRuntimeStatus", () => {
    it("maps SUCCEEDED and SUCCESS to SUCCESS", () => {
      expect(mapRuntimeStatus("SUCCEEDED")).toBe("SUCCESS");
      expect(mapRuntimeStatus("succeeded")).toBe("SUCCESS");
      expect(mapRuntimeStatus("SUCCESS")).toBe("SUCCESS");
      expect(mapRuntimeStatus("PASSED")).toBe("SUCCESS");
    });

    it("maps FAILED and ERROR to FAILED", () => {
      expect(mapRuntimeStatus("FAILED")).toBe("FAILED");
      expect(mapRuntimeStatus("failed")).toBe("FAILED");
      expect(mapRuntimeStatus("ERROR")).toBe("FAILED");
    });

    it("maps BLOCKED and unknown/null to BLOCKED", () => {
      expect(mapRuntimeStatus("BLOCKED")).toBe("BLOCKED");
      expect(mapRuntimeStatus("blocked")).toBe("BLOCKED");
      expect(mapRuntimeStatus(null)).toBe("BLOCKED");
      expect(mapRuntimeStatus(undefined)).toBe("BLOCKED");
      expect(mapRuntimeStatus("RANDOM")).toBe("BLOCKED");
    });
  });

  describe("Kill Switch & Rollback Actions", () => {
    it("calls kill-switch endpoint with correct method and body", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          change_request_id: "cr-1",
          state: "SUSPENDED",
          kill_switch_active: true,
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await killAgent("cr-1", "Deteksi anomali keamanan sirkuit");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://backend.alos.test/api/v1/release-requests/cr-1/kill-switch");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ reason: "Deteksi anomali keamanan sirkuit" });
      expect(result.state).toBe("SUSPENDED");
    });

    it("calls clear-kill-switch endpoint with correct method and body", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          change_request_id: "cr-1",
          state: "SUSPENDED",
          kill_switch_active: false,
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await clearKillSwitch("cr-1", "Investigasi selesai, sistem aman");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(
        "https://backend.alos.test/api/v1/release-requests/cr-1/clear-kill-switch",
      );
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ reason: "Investigasi selesai, sistem aman" });
      expect(result.kill_switch_active).toBe(false);
    });

    it("calls rollback endpoint with target semantic version and reason", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          change_request_id: "cr-1",
          state: "ROLLED_BACK",
          semantic_version: "1.0.0",
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await rollbackAgent("cr-1", "1.0.0", "Kembali ke versi stabil sebelumnya");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://backend.alos.test/api/v1/release-requests/cr-1/rollback");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({
        target_semantic_version: "1.0.0",
        reason: "Kembali ke versi stabil sebelumnya",
      });
      expect(result.state).toBe("ROLLED_BACK");
    });

    it("throws when reason is empty for killAgent or rollbackAgent", async () => {
      await expect(killAgent("cr-1", "   ")).rejects.toThrow("Alasan aktivasi Kill Switch wajib diisi.");
      await expect(rollbackAgent("cr-1", "1.0.0", "  ")).rejects.toThrow("Alasan rollback wajib diisi.");
      await expect(rollbackAgent("cr-1", "  ", "Valid reason")).rejects.toThrow("Versi target rollback wajib ditentukan.");
    });
  });

  describe("Agent CRUD Actions", () => {
    it("calls update draft with PUT", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          agent_key: "AGENT_ONE",
          lifecycle_status: "DRAFT",
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const payload = {
        workspace_id: "ws-1",
        agent_key: "AGENT_ONE",
        name: "Updated Agent",
        objective: "Updated objective for the agent",
        risk_level: "LOW" as const,
        input_schema: {},
        output_schema: {},
        model_policy: {},
        tool_keys: [],
        permission_keys: [],
        approval_required: true,
        timeout_seconds: 60,
        data_classification: "INTERNAL" as const,
        forbidden_actions: ["no external net"],
        kpis: [{ name: "latency", target: 100 }],
      };

      await updateAgentDraft("AGENT_ONE", payload);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://backend.alos.test/api/v1/agents/AGENT_ONE/draft");
      expect(options.method).toBe("PUT");
    });

    it("calls delete draft with DELETE", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
        json: async () => null,
      });
      vi.stubGlobal("fetch", fetchMock);

      await deleteAgentDraft("AGENT_ONE");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://backend.alos.test/api/v1/agents/AGENT_ONE/draft");
      expect(options.method).toBe("DELETE");
    });

    it("calls retire agent with POST", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          agent_key: "AGENT_ONE",
          lifecycle_status: "RETIRED",
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      await retireAgent("AGENT_ONE");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://backend.alos.test/api/v1/agents/AGENT_ONE/retire");
      expect(options.method).toBe("POST");
    });
  });
});

