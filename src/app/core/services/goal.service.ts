import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { ResultEntity } from '../models/result-entity.model';
import { BaseService } from '../bases/base/base-service';
import { GoalsOverviewResponse } from '../models/goals/goals-overview-response.model';
import { CreateFinancialGoalRequest } from '../models/goals/create-financial-goal-request.model';
import { UpdateFinancialGoalRequest } from '../models/goals/update-financial-goal-request.model';
import { CancelFinancialGoalRequest } from '../models/goals/cancel-financial-goal-request.model';
import { FinancialGoalResponse } from '../models/goals/financial-goal-response.model';
import { RegisterContributionRequest } from '../models/goals/register-contribution-request.model';
import { ContributionResponse } from '../models/goals/contribution-response.model';
import { CreateCategoryBudgetGoalRequest } from '../models/goals/create-category-budget-goal-request.model';
import { UpdateCategoryBudgetGoalRequest } from '../models/goals/update-category-budget-goal-request.model';
import { DeactivateCategoryBudgetGoalRequest } from '../models/goals/deactivate-category-budget-goal-request.model';
import { CategoryBudgetGoalResponse } from '../models/goals/category-budget-goal-response.model';
import { GoalViabilityResponse } from '../models/goals/goal-viability-response.model';
import { SimulateExtraContributionRequest } from '../models/goals/simulate-extra-contribution-request.model';
import { SimulateExtraContributionResponse } from '../models/goals/simulate-extra-contribution-response.model';
import { CategoryGoalStrategyResponse } from '../models/goals/category-goal-strategy-response.model';
import { GoalHistoryResponse } from '../models/goals/goal-history-response.model';
import { RetryFinancialGoalRequest } from '../models/goals/retry-financial-goal-request.model';

@Injectable({ providedIn: 'root' })
export class GoalService extends BaseService {
  private apiUrl = this.url + '/goals';

  getOverview(): Observable<ResultEntity<GoalsOverviewResponse>> {
    return this.http.get<ResultEntity<GoalsOverviewResponse>>(`${this.apiUrl}/overview`);
  }

  createFinancialGoal(request: CreateFinancialGoalRequest): Observable<ResultEntity<FinancialGoalResponse>> {
    return this.http.post<ResultEntity<FinancialGoalResponse>>(`${this.apiUrl}/createfinancialgoal`, request);
  }

  updateFinancialGoal(request: UpdateFinancialGoalRequest): Observable<ResultEntity<FinancialGoalResponse>> {
    return this.http.put<ResultEntity<FinancialGoalResponse>>(`${this.apiUrl}/updatefinancialgoal`, request);
  }

  cancelFinancialGoal(request: CancelFinancialGoalRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(`${this.apiUrl}/cancelfinancialgoal`, { body: request });
  }

  registerContribution(request: RegisterContributionRequest): Observable<ResultEntity<ContributionResponse>> {
    return this.http.post<ResultEntity<ContributionResponse>>(`${this.apiUrl}/registercontribution`, request);
  }

  getFinancialGoalDetail(goalId: number): Observable<ResultEntity<GoalViabilityResponse>> {
    return this.http
      .get<ResultEntity<GoalViabilityResponse>>(`${this.apiUrl}/financial/${goalId}/detail`)
      .pipe(timeout(20000));
  }

  simulateExtraContribution(
    request: SimulateExtraContributionRequest,
  ): Observable<ResultEntity<SimulateExtraContributionResponse>> {
    return this.http.post<ResultEntity<SimulateExtraContributionResponse>>(
      `${this.apiUrl}/simulateextracontribution`,
      request,
    );
  }

  createCategoryBudgetGoal(
    request: CreateCategoryBudgetGoalRequest,
  ): Observable<ResultEntity<CategoryBudgetGoalResponse>> {
    return this.http.post<ResultEntity<CategoryBudgetGoalResponse>>(
      `${this.apiUrl}/createcategorybudgetgoal`,
      request,
    );
  }

  updateCategoryBudgetGoal(
    request: UpdateCategoryBudgetGoalRequest,
  ): Observable<ResultEntity<CategoryBudgetGoalResponse>> {
    return this.http.put<ResultEntity<CategoryBudgetGoalResponse>>(
      `${this.apiUrl}/updatecategorybudgetgoal`,
      request,
    );
  }

  deactivateCategoryBudgetGoal(request: DeactivateCategoryBudgetGoalRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(`${this.apiUrl}/deactivatecategorybudgetgoal`, { body: request });
  }

  getCategoryGoalStrategy(goalId: number): Observable<ResultEntity<CategoryGoalStrategyResponse>> {
    return this.http
      .get<ResultEntity<CategoryGoalStrategyResponse>>(`${this.apiUrl}/category/${goalId}/getcategorystrategy`)
      .pipe(timeout(20000));
  }

  getHistory(search?: string | null): Observable<ResultEntity<GoalHistoryResponse>> {
    const params: Record<string, string> = search ? { search } : {};
    return this.http.get<ResultEntity<GoalHistoryResponse>>(`${this.apiUrl}/financial/history`, { params });
  }

  retry(request: RetryFinancialGoalRequest): Observable<ResultEntity<FinancialGoalResponse>> {
    return this.http.post<ResultEntity<FinancialGoalResponse>>(`${this.apiUrl}/retry`, request);
  }
}
