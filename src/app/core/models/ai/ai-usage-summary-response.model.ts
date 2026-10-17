import { AiUsageByFeatureResponse } from './ai-usage-by-feature-response.model';

export interface AiUsageSummaryResponse {
  year: number;
  month: number;
  calls: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  byFeature: AiUsageByFeatureResponse[];
}
