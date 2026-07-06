import { GoalPriority } from './goal-priority.model';

export interface CreateCategoryBudgetGoalRequest {
  categoryId: number;
  monthlyLimit: number;
  priority: GoalPriority;
}
