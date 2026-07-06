import { FinancialGoalStatus } from './financial-goal-status.model';

export interface ContributionResponse {
  currentAmount: number;
  status: FinancialGoalStatus;
}
