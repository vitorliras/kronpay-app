import { GoalPriority } from './goal-priority.model';

export interface CategoryBudgetGoalResponse {
  id: number;
  categoryId: number;
  monthlyLimit: number;
  priority: GoalPriority;
  active: boolean;
  currentPeriodSpent: number;
}
