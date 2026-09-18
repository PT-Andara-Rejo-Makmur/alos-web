import { apiRequest } from "@/lib/api";

import type {
  ResearchBackendAdapter,
  ResearchRequestCommand,
  ResearchRequestReceipt,
} from "./models";

const RESEARCH_BACKEND_PATH = "/api/v1/research/requests";

export const backendResearchAdapter: ResearchBackendAdapter = {
  async request(command: ResearchRequestCommand): Promise<ResearchRequestReceipt> {
    return apiRequest<ResearchRequestReceipt>(RESEARCH_BACKEND_PATH, {
      method: "POST",
      body: {
        question: command.question,
        source_mode: command.sourceMode,
        domain: command.domain,
      },
    });
  },
};
