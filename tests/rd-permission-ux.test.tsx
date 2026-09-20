import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GenesisRdGovernanceView } from "@/experiences/genesis";
import {
  projectBackendDomainAccess,
  RdPermissionPanel,
  SharedResearchWorkspace,
  type ResearchBackendAdapter,
  type ResearchDomainAccessRecord,
} from "@/features/research";

afterEach(cleanup);

const domainAccess: readonly ResearchDomainAccessRecord[] = [
  {
    domain: "TECHNOLOGY",
    status: "AUTHORIZED",
    is_allowed: true,
    reason: "Diizinkan oleh ALOS Backend.",
    required_scope: "research.technology",
  },
  {
    domain: "PROPERTY_BUSINESS",
    status: "DENIED",
    is_allowed: false,
    reason: "Ditolak oleh ALOS Backend.",
    required_scope: "research.property_business",
  },
  {
    domain: "MANAGEMENT",
    status: "AUTHORIZED",
    is_allowed: true,
    reason: "Diizinkan oleh ALOS Backend.",
  },
  {
    domain: "PROPERTY_MARKET",
    status: "DENIED",
    is_allowed: false,
    reason: "Ditolak oleh ALOS Backend.",
  },
];

describe("R&D Permission UX", () => {
  it("menampilkan tepat empat domain canonical", () => {
    render(
      <RdPermissionPanel
        domainPermissions={projectBackendDomainAccess(domainAccess)}
        selectedDomain="TECHNOLOGY"
      />,
    );

    expect(screen.getByText("Teknologi")).toBeInTheDocument();
    expect(screen.getByText("Model Bisnis Properti")).toBeInTheDocument();
    expect(screen.getByText("Manajemen Perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Properti")).toBeInTheDocument();
  });

  it("memproyeksikan keputusan akses yang diberikan Backend tanpa menghitung ulang scope", () => {
    const permissions = projectBackendDomainAccess(domainAccess);
    expect(permissions.TECHNOLOGY.isAllowed).toBe(true);
    expect(permissions.PROPERTY_BUSINESS.isAllowed).toBe(false);

    render(
      <RdPermissionPanel
        domainPermissions={permissions}
        selectedDomain="TECHNOLOGY"
      />,
    );

    expect(screen.getByTestId("rd-domain-card-TECHNOLOGY")).toHaveTextContent(
      "AUTHORIZED",
    );
    expect(screen.getByTestId("rd-domain-card-PROPERTY_BUSINESS")).toHaveTextContent(
      "DENIED",
    );
  });

  it("fail-closed ketika Backend belum memberikan projection akses", () => {
    render(
      <RdPermissionPanel
        domainPermissions={projectBackendDomainAccess()}
        selectedDomain="TECHNOLOGY"
      />,
    );

    for (const card of screen.getAllByRole("listitem")) {
      expect(card).toHaveTextContent("UNAVAILABLE");
      expect(card).toHaveTextContent("Otorisasi domain belum diterima dari ALOS Backend.");
    }
  });

  it("pemilihan domain tidak mengubah keputusan akses Backend", () => {
    const onSelectDomain = vi.fn();
    render(
      <RdPermissionPanel
        domainPermissions={projectBackendDomainAccess(domainAccess)}
        selectedDomain="TECHNOLOGY"
        onSelectDomain={onSelectDomain}
      />,
    );

    const propertyCard = screen.getByTestId("rd-domain-card-PROPERTY_MARKET");
    fireEvent.click(propertyCard.querySelector("button")!);

    expect(onSelectDomain).toHaveBeenCalledWith("PROPERTY_MARKET");
    expect(propertyCard).toHaveTextContent("DENIED");
    expect(propertyCard).not.toHaveTextContent("AUTHORIZED");
  });

  it("merender tata kelola dari projection Backend", () => {
    render(<GenesisRdGovernanceView initialDomainAccess={domainAccess} />);
    expect(screen.getByTestId("genesis-rd-governance")).toBeInTheDocument();
    expect(screen.getByText("Status Tata Kelola 4 Domain R&D")).toBeInTheDocument();
  });

  it("menangani error request Backend dan mempertahankan correlation id", async () => {
    const mockAdapter: ResearchBackendAdapter = {
      loadDomainAccess: vi.fn().mockResolvedValue({ domains: domainAccess }),
      request: vi.fn().mockRejectedValue({
        code: "SCOPE_DENIED",
        status: 403,
        message: "Domain request not authorized for current actor",
        correlation_id: "corr_rd_denied_99",
      }),
    };

    render(
      <SharedResearchWorkspace
        adapter={mockAdapter}
        initialDomainAccess={domainAccess}
      />,
    );

    fireEvent.change(screen.getByLabelText("Research question"), {
      target: { value: "Analisis tata kelola teknologi perusahaan" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Request research via Backend" }));

    expect(await screen.findByTestId("safe-error-panel")).toBeInTheDocument();
    expect(screen.getByText("Akses Scope Ditolak")).toBeInTheDocument();
    expect(screen.getByText("Ref: corr_rd_denied_99")).toBeInTheDocument();
  });
});
