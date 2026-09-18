import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GovernanceConfirmationModal, GovernanceFeedback, GovernanceNavigation } from "@/features/mvp1/components/governance-control-ui";

describe("Governance control UI", () => {
  it("marks the active control-center area", () => {
    const html = renderToStaticMarkup(<GovernanceNavigation active="releases" />);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Release Requests");
    expect(html).toContain("Reviews &amp; Approval");
    expect(html).toContain("Runtime &amp; Monitoring");
  });

  it("renders what happened, why, next action, and a reference id", () => {
    const html = renderToStaticMarkup(<GovernanceFeedback error={{ title: "Aksi diblokir", reason: "Role tidak sesuai.", nextAction: "Gunakan Checker independen.", status: 403, correlationId: "corr-403" }} notice="" />);
    expect(html).toContain("Aksi diblokir");
    expect(html).toContain("Langkah berikutnya");
    expect(html).toContain("corr-403");
  });

  it("uses an accessible modal for destructive lifecycle actions", () => {
    const html = renderToStaticMarkup(<GovernanceConfirmationModal busy={false} confirmation={{ title: "Aktifkan Kill Switch", impact: "Agent dihentikan segera.", confirmLabel: "Konfirmasi", destructive: true, onConfirm: () => undefined }} onCancel={() => undefined} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("audit record permanen");
  });
});


