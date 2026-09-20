"use client";

import { useEffect, useMemo, useState } from "react";

import {
  backendResearchAdapter,
  projectBackendDomainAccess,
  RdPermissionPanel,
  type ResearchBackendAdapter,
  type ResearchDomainAccessRecord,
  type ResearchDomainId,
} from "@/features/research";

export function GenesisRdGovernanceView({
  adapter = backendResearchAdapter,
  initialDomainAccess,
}: {
  readonly adapter?: ResearchBackendAdapter;
  readonly initialDomainAccess?: readonly ResearchDomainAccessRecord[];
}) {
  const [domainAccess, setDomainAccess] = useState<
    readonly ResearchDomainAccessRecord[] | undefined
  >(initialDomainAccess);
  const [selectedDomain, setSelectedDomain] = useState<ResearchDomainId>("TECHNOLOGY");

  useEffect(() => {
    if (initialDomainAccess !== undefined) return;
    const controller = new AbortController();
    adapter
      .loadDomainAccess(controller.signal)
      .then((response) => setDomainAccess(response.domains))
      .catch(() => setDomainAccess(undefined));
    return () => controller.abort();
  }, [adapter, initialDomainAccess]);

  const permissions = useMemo(
    () => projectBackendDomainAccess(domainAccess),
    [domainAccess],
  );

  return (
    <section
      className="panel genesis-rd-governance"
      aria-labelledby="genesis-rd-title"
      data-testid="genesis-rd-governance"
    >
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">IT ASSURANCE & RESEARCH DOMAIN GOVERNANCE</p>
          <h2 id="genesis-rd-title">Status Tata Kelola 4 Domain R&D</h2>
        </div>
        <span className="status-pill status-pill--success">IT Governed</span>
      </div>

      <RdPermissionPanel
        domainPermissions={permissions}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
      />
    </section>
  );
}
