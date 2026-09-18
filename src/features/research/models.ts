export type ResearchSourceMode = "INTERNAL" | "EXTERNAL";

export interface ResearchDomainOption {
  readonly id: "TECHNOLOGY" | "PROPERTY_BUSINESS" | "MANAGEMENT" | "PROPERTY";
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
    id: "PROPERTY",
    label: "Properti",
    description: "Market, region, competitor, regulation, dan tren sosial.",
  },
] as const;

export interface ResearchRequestCommand {
  readonly question: string;
  readonly sourceMode: ResearchSourceMode;
  readonly domain: ResearchDomainOption["id"];
}

export interface ResearchRequestReceipt {
  readonly requestId: string;
  readonly state: "RECEIVED" | "NEEDS_REVIEW";
}

export interface ResearchBackendAdapter {
  request(command: ResearchRequestCommand): Promise<ResearchRequestReceipt>;
}
