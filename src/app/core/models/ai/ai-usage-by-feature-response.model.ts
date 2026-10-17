export interface AiUsageByFeatureResponse {
  feature: string;
  calls: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}
