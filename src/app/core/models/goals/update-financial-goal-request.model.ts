import { GoalPriority } from './goal-priority.model';

export interface UpdateFinancialGoalRequest {
  id: number;
  description: string;
  targetAmount: number;
  targetDate: string;
  priority: GoalPriority;
}
