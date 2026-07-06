import { GoalPriority } from './goal-priority.model';

export interface CreateFinancialGoalRequest {
  description: string;
  targetAmount: number;
  targetDate: string;
  priority: GoalPriority;
}
