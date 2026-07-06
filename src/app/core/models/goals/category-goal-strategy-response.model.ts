import { CategorySpendingGroupResponse } from './category-spending-group-response.model';
import { CategorySpendingTrendResponse } from './category-spending-trend-response.model';

export interface CategoryGoalStrategyResponse {
  groupedBySubcategory: boolean;
  groups: CategorySpendingGroupResponse[];
  trend: CategorySpendingTrendResponse;
  suggestionMessageKey: string;
  suggestionArgs: Record<string, string>;
}
