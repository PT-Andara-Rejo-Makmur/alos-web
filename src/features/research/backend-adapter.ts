import { authenticatedApiRequest } from "@/lib/api";

import type {
  ResearchBackendAdapter,
  ResearchDomainAccessResponse,
  ResearchRequestCommand,
  ResearchRequestReceipt,
} from "./models";

const RESEARCH_DOMAIN_ACCESS_PATH = "/api/v1/research/domain-access";
const RESEARCH_REQUEST_PATH = "/api/v1/research/requests";

export const backendResearchAdapter: ResearchBackendAdapter = {
  async loadDomainAccess(signal?: AbortSignal): Promise<ResearchDomainAccessResponse> {
    return authenticatedApiRequest<ResearchDomainAccessResponse>(RESEARCH_DOMAIN_ACCESS_PATH, {
      signal,
      cache: "no-store",
    });
  },
  async request(command: ResearchRequestCommand): Promise<ResearchRequestReceipt> {
    return authenticatedApiRequest<ResearchRequestReceipt>(RESEARCH_REQUEST_PATH, {
      method: "POST",
      body: {
        question: command.question,
        source_mode: command.sourceMode,
        domain: command.domain,
      },
    });
  },
};
