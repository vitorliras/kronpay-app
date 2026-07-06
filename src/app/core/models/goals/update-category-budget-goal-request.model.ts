import { GoalPriority } from './goal-priority.model';

export interface UpdateCategoryBudgetGoalRequest {
  id: number;
  monthlyLimit: number;
  priority: GoalPriority;
}
