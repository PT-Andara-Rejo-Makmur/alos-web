import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AgentCapabilitySummaryCard, AgentCapabilitySummaryList } from "@/features/agents";

afterEach(cleanup);

describe("Agent and Capability summary", () => {
  it("menampilkan seluruh field review IT dari Backend projection", () => {
    render(
      <AgentCapabilitySummaryCard
        item={{
          identifier: "agent.research.001",
          kind: "AGENT",
          purpose: "Analyze governed research evidence.",
          capabilityType: "AGENT",
          version: "1.2.0",
          scope: ["scope.workspace"],
          risk: "HIGH",
          tools: ["source.search"],
          lifecycleState: "DRAFT",
          readiness: "NEEDS_REVIEW",
        }}
      />,
    );

    for (const value of [
      "Analyze governed research evidence.",
      "AGENT",
      "1.2.0",
      "scope.workspace",
      "HIGH",
      "source.search",
      "DRAFT",
      "NEEDS_REVIEW",
    ]) {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    }
  });

  it("tidak membuat registry state ketika Backend belum mengirim data", () => {
    render(<AgentCapabilitySummaryList items={[]} />);
    expect(screen.getByText("Menunggu Registry API Backend")).toBeInTheDocument();
    expect(screen.getByText(/Tidak ada Agent atau Capability state/)).toBeInTheDocument();
  });
});
