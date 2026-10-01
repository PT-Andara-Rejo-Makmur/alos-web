import { authenticatedApiRequest } from "@/lib/api";
import { recordApi } from "@/features/business-records/record-api";
import type {
  MarketingCampaignCreateRequest,
  MarketingCampaignUpdateRequest,
  MarketingCampaignProjection,
  MarketingCampaignListProjection,
  MarketingCampaignTransitionRequest,
  MarketingChannelCreateRequest,
  MarketingChannelUpdateRequest,
  MarketingChannelProjection,
  MarketingChannelListProjection,
  MarketingChannelTransitionRequest,
  MarketingAttributionCreateRequest,
  MarketingAttributionUpdateRequest,
  MarketingAttributionProjection,
  MarketingAttributionListProjection,
  MarketingContentCreateRequest,
  MarketingContentUpdateRequest,
  MarketingContentProjection,
  MarketingContentListProjection,
  MarketingContentTransitionRequest,
  MarketingOverview
} from "@/lib/contracts";

export const marketingApi = {
  overview(signal?: AbortSignal) { return authenticatedApiRequest<MarketingOverview>("/api/v1/marketing/overview", { signal }); },
  campaigns: recordApi<MarketingCampaignCreateRequest, MarketingCampaignUpdateRequest, MarketingCampaignProjection, MarketingCampaignListProjection, MarketingCampaignTransitionRequest>("/api/v1/marketing/campaigns"),
  channels: recordApi<MarketingChannelCreateRequest, MarketingChannelUpdateRequest, MarketingChannelProjection, MarketingChannelListProjection, MarketingChannelTransitionRequest>("/api/v1/marketing/channels"),
  attributions: recordApi<MarketingAttributionCreateRequest, MarketingAttributionUpdateRequest, MarketingAttributionProjection, MarketingAttributionListProjection, object>("/api/v1/marketing/attributions"),
  contents: recordApi<MarketingContentCreateRequest, MarketingContentUpdateRequest, MarketingContentProjection, MarketingContentListProjection, MarketingContentTransitionRequest>("/api/v1/marketing/contents"),
};
