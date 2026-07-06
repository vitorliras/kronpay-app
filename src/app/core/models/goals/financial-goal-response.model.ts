import { GoalPriority } from './goal-priority.model';
import { FinancialGoalStatus } from './financial-goal-status.model';

export interface FinancialGoalResponse {
  id: number;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: GoalPriority;
  status: FinancialGoalStatus;
  createdAt: string;
  completedAt?: string;
  previousAttemptGoalId?: number;
}
