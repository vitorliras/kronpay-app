import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { take } from 'rxjs';
import { Base } from '../../../../core/bases/base/base';
import { GoalService } from '../../../../core/services/goal.service';
import { CategoryBudgetGoalResponse } from '../../../../core/models/goals/category-budget-goal-response.model';
import { FinancialGoalResponse } from '../../../../core/models/goals/financial-goal-response.model';
import { CategoryGoalStrategyResponse } from '../../../../core/models/goals/category-goal-strategy-response.model';
import { SpendingTrendDirection } from '../../../../core/models/goals/spending-trend-direction.model';

@Component({
  selector: 'app-goal-detail-category',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './goal-detail-category.html',
  styleUrl: './goal-detail-category.scss',
})
export class GoalDetailCategory extends Base implements OnInit {
  @Input({ required: true }) goal!: CategoryBudgetGoalResponse;
  @Input({ required: true }) categoryName!: string;
  @Input() activeFinancialGoals: FinancialGoalResponse[] = [];
  private cdr = inject(ChangeDetectorRef);

  private goalService = inject(GoalService);

  strategy: CategoryGoalStrategyResponse | null = null;
  isLoading = true;
  accelerationText: string | null = null;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.goalService.getCategoryGoalStrategy(this.goal.id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.value) {
          this.strategy = res.value;
          this.composeAcceleration();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;

        this.messageWarning('OperationFailed');
        this.cdr.detectChanges();
      },
    });
  }

  trendKey(direction: SpendingTrendDirection): string {
    switch (direction) {
      case SpendingTrendDirection.Rising:
        return 'TrendRising';
      case SpendingTrendDirection.Falling:
        return 'TrendFalling';
      default:
        return 'TrendStable';
    }
  }

  suggestionText(t: Record<string, string>): string {
    if (!this.strategy) return '';

    let message = t[this.strategy.suggestionMessageKey] ?? '';
    const args = this.strategy.suggestionArgs ?? {};

    for (const key of Object.keys(args)) {
      message = message.replace(`{${key}}`, args[key]);
    }

    return message;
  }

  private composeAcceleration(): void {
    if (
      !this.strategy ||
      this.strategy.groups.length === 0 ||
      this.activeFinancialGoals.length === 0
    )
      return;

    const biggestGroup = this.strategy.groups[0];
    const targetGoal = this.activeFinancialGoals[0];

    this.goalService
      .simulateExtraContribution({
        goalId: targetGoal.id,
        extraMonthlyAmount: biggestGroup.amount,
      })
      .subscribe((res) => {
        if (!res.isSuccess || !res.value || res.value.daysAccelerated <= 0) return;

        this.translations$.pipe(take(1)).subscribe((t) => {
          let message = t['AcceleratesGoalIn'] ?? '';
          message = message.replace('{goal}', targetGoal.description);
          message = message.replace('{days}', String(res.value!.daysAccelerated));
          this.accelerationText = message;
        });
      });
  }
}
