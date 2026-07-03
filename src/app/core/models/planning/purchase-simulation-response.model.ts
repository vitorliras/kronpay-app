import { ProjectionMonthResponse } from './projection-month-response.model';
import { ViabilityResponse } from './viability-response.model';

export interface PurchaseSimulationResponse {
  baseFinalBalance: number;
  simulatedFinalBalance: number;
  safetyReserve: number;
  firstNegativeYear: number | null;
  firstNegativeMonth: number | null;
  viability: ViabilityResponse;
  months: ProjectionMonthResponse[];
}
