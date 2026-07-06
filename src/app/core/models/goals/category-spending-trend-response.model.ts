import { SpendingTrendDirection } from './spending-trend-direction.model';

export interface CategorySpendingTrendResponse {
  currentPeriodSpent: number;
  historicalAverage: number;
  direction: SpendingTrendDirection;
}
