import { ProjectionMonthResponse } from './projection-month-response.model';
import { ViabilityResponse } from './viability-response.model';

export interface FinancialProjectionResponse {
  initialBalance: number;
  finalBalance: number;
  safetyReserve: number;
  firstNegativeYear: number | null;
  firstNegativeMonth: number | null;
  viability: ViabilityResponse;
  months: ProjectionMonthResponse[];
}
