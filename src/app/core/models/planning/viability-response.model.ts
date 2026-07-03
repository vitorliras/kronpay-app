import { ViabilityFindingResponse } from './viability-finding-response.model';

export interface ViabilityResponse {
  score: number;
  verdict: string;
  findings: ViabilityFindingResponse[];
}
