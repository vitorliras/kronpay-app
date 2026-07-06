import { FinancialGoalResponse } from './financial-goal-response.model';
import { CategoryBudgetGoalResponse } from './category-budget-goal-response.model';

export interface GoalsOverviewResponse {
  financialGoals: FinancialGoalResponse[];
  categoryBudgetGoals: CategoryBudgetGoalResponse[];
}
