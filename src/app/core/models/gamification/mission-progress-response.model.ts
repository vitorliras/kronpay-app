export interface MissionProgressResponse {
  type: string;
  area: string;
  messageKey: string;
  significance: string;
  isGain: boolean;
  isActive: boolean;
  lastEvaluatedAt: string;
}
