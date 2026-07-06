import { GoalStrategyLabel } from './goal-strategy-label.model';

export interface GoalStrategyOptionResponse {
  label: GoalStrategyLabel;
  monthlyContribution: number;
  projectedCompletionDate?: string;
  safetyReserveImpact: number;
}
