import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { canManageDraftAgent, canTestActiveAgent, conversationGroup, groupConversations, normalizeGenesisError, type GenesisConversation } from "@/features/genesis-workspace/types";

const now = new Date("2026-09-09T12:00:00+07:00");
const conversation = (id: string, date: string): GenesisConversation => ({ conversation_id: id, workspace_id: "workspace", title: id, context_mode: "AUTO", status: "OPEN", created_at: date, updated_at: date });

describe("GENESIS workspace helpers", () => {
  it("groups conversation navigation by recency", () => {
    expect(conversationGroup("2026-09-09T08:00:00+07:00", now)).toBe("Today");
    expect(conversationGroup("2026-09-08T08:00:00+07:00", now)).toBe("Yesterday");
    expect(groupConversations([conversation("recent", "2026-09-05T08:00:00+07:00")], now)["Previous 7 Days"]).toHaveLength(1);
  });

  it("keeps active testing and draft mutation role-aware", () => {
    expect(canTestActiveAgent(["IT_ADMIN"])).toBe(true);
    expect(canTestActiveAgent(["EXECUTIVE"])).toBe(false);
    expect(canManageDraftAgent(["IT_ADMIN"])).toBe(true);
    expect(canManageDraftAgent(["EXECUTIVE"])).toBe(false);
  });

  it("normalizes inactive Agent and unauthorized context failures", () => {
    expect(normalizeGenesisError(new ApiError(403, "selected Agent is no longer ACTIVE or is outside the actor scope", "agent-ref"))).toMatchObject({ title: "Agent tidak dapat digunakan", correlationId: "agent-ref" });
    expect(normalizeGenesisError(new ApiError(403, "attached context is outside the actor scope", "context-ref"))).toMatchObject({ title: "Context gagal dilampirkan", correlationId: "context-ref" });
  });
});
