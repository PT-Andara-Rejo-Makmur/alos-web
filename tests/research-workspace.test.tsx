import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  researchDomains,
  SharedResearchWorkspace,
  type ResearchBackendAdapter,
  type ResearchDomainAccessRecord,
} from "@/features/research";

afterEach(cleanup);

describe("shared R&D workspace", () => {
  it("menyediakan INTERNAL dan EXTERNAL sebagai request mode", () => {
    render(<SharedResearchWorkspace />);

    expect(screen.getByLabelText("INTERNAL")).toBeChecked();
    fireEvent.click(screen.getByLabelText("EXTERNAL"));
    expect(screen.getByLabelText("EXTERNAL")).toBeChecked();
    expect(screen.getByText(/EXTERNAL adalah untrusted input/)).toBeInTheDocument();
  });

  it("menyediakan tepat empat domain dalam satu selector", () => {
    render(<SharedResearchWorkspace />);

    expect(researchDomains.map((domain) => domain.label)).toEqual([
      "Teknologi",
      "Model Bisnis Properti",
      "Manajemen Perusahaan",
      "Properti",
    ]);
    expect(screen.getAllByRole("option")).toHaveLength(4);
    fireEvent.change(screen.getByLabelText("R&D domain"), {
      target: { value: "PROPERTY_BUSINESS" },
    });
    expect(screen.getByText(/unit economics/)).toBeInTheDocument();
  });

  it("menampilkan canonical receipt dan correlation dari Backend", async () => {
    const access: readonly ResearchDomainAccessRecord[] = [
      {
        domain: "TECHNOLOGY",
        status: "AUTHORIZED",
        is_allowed: true,
        reason: "Authorized by ALOS Backend policy.",
      },
    ];
    const adapter: ResearchBackendAdapter = {
      loadDomainAccess: vi.fn().mockResolvedValue({
        domains: access,
        correlation_id: "corr_access_001",
      }),
      request: vi.fn().mockResolvedValue({
        request_id: "research_public_001",
        state: "NEEDS_REVIEW",
        decision: "REQUEST_EXTERNAL_RESEARCH",
        correlation_id: "corr_research_public_001",
      }),
    };

    render(
      <SharedResearchWorkspace adapter={adapter} initialDomainAccess={access} />,
    );
    fireEvent.change(screen.getByLabelText("Research question"), {
      target: { value: "Apa teknologi yang relevan untuk operasi perusahaan?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Request research via Backend" }));

    expect(await screen.findByText(/research_public_001/)).toHaveTextContent(
      "Decision: REQUEST_EXTERNAL_RESEARCH",
    );
    expect(screen.getByText(/research_public_001/)).toHaveTextContent(
      "Ref: corr_research_public_001",
    );
  });
});
