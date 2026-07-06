import { GoalStrategyOptionResponse } from './goal-strategy-option-response.model';

export interface GoalViabilityResponse {
  atRisk: boolean;
  strategies: GoalStrategyOptionResponse[];
}
