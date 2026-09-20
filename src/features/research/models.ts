import type {
  ResearchDomain,
  ResearchDomainAccessRecord,
  ResearchDomainAccessResponse,
  ResearchDomainAccessStatus,
  ResearchRequestReceipt,
  ResearchSourceMode,
} from "@/lib/contracts";

export type ResearchDomainId = ResearchDomain;
export type {
  ResearchDomainAccessRecord,
  ResearchDomainAccessResponse,
  ResearchDomainAccessStatus,
  ResearchRequestReceipt,
  ResearchSourceMode,
};

export interface ResearchDomainOption {
  readonly id: ResearchDomainId;
  readonly label: string;
  readonly description: string;
}

export const researchDomains: readonly ResearchDomainOption[] = [
  {
    id: "TECHNOLOGY",
    label: "Teknologi",
    description: "Model, framework, tool, architecture, security, dan interoperability.",
  },
  {
    id: "PROPERTY_BUSINESS",
    label: "Model Bisnis Properti",
    description: "Paket, pricing, unit economics, dan scenario bisnis properti.",
  },
  {
    id: "MANAGEMENT",
    label: "Manajemen Perusahaan",
    description: "SOP, KPI, governance, process, dan operating model.",
  },
  {
    id: "PROPERTY_MARKET",
    label: "Properti",
    description: "Market, region, competitor, regulation, dan tren sosial.",
  },
] as const;

export interface ResearchDomainPermissionState {
  readonly domainId: ResearchDomainId;
  readonly label: string;
  readonly description: string;
  readonly status: ResearchDomainAccessStatus;
  readonly isAllowed: boolean;
  readonly requiredScope?: string;
  readonly reason: string;
}

export function projectBackendDomainAccess(
  records?: readonly ResearchDomainAccessRecord[],
): Record<ResearchDomainId, ResearchDomainPermissionState> {
  const projected = Object.fromEntries(
    researchDomains.map((option) => [
      option.id,
      {
        domainId: option.id,
        label: option.label,
        description: option.description,
        status: "UNAVAILABLE" as const,
        isAllowed: false,
        reason: "Otorisasi domain belum diterima dari ALOS Backend.",
      },
    ]),
  ) as Record<ResearchDomainId, ResearchDomainPermissionState>;

  for (const record of records ?? []) {
    const option = researchDomains.find((candidate) => candidate.id === record.domain);
    if (!option) continue;
    const status: ResearchDomainAccessStatus = ["AUTHORIZED", "DENIED", "UNAVAILABLE"].includes(
      record.status,
    )
      ? record.status
      : "UNAVAILABLE";
    projected[record.domain] = {
      domainId: record.domain,
      label: option.label,
      description: option.description,
      status,
      isAllowed: status === "AUTHORIZED" && record.is_allowed === true,
      requiredScope: record.required_scope,
      reason: record.reason,
    };
  }

  return projected;
}

export interface ResearchRequestCommand {
  readonly question: string;
  readonly sourceMode: ResearchSourceMode;
  readonly domain: ResearchDomainId;
}

export interface ResearchBackendAdapter {
  loadDomainAccess(signal?: AbortSignal): Promise<ResearchDomainAccessResponse>;
  request(command: ResearchRequestCommand): Promise<ResearchRequestReceipt>;
}
