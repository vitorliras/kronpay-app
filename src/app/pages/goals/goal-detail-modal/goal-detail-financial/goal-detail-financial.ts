import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Base } from '../../../../core/bases/base/base';
import { GoalService } from '../../../../core/services/goal.service';
import { FinancialGoalResponse } from '../../../../core/models/goals/financial-goal-response.model';
import { GoalViabilityResponse } from '../../../../core/models/goals/goal-viability-response.model';
import { GoalStrategyLabel } from '../../../../core/models/goals/goal-strategy-label.model';

@Component({
  selector: 'app-goal-detail-financial',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './goal-detail-financial.html',
  styleUrl: './goal-detail-financial.scss',
})
export class GoalDetailFinancial extends Base implements OnInit {
  @Input({ required: true }) goal!: FinancialGoalResponse;

  private goalService = inject(GoalService);

  viability: GoalViabilityResponse | null = null;
  isLoading = true;
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.goalService.getFinancialGoalDetail(this.goal.id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.value) {
          this.viability = res.value;
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

  strategyLabelKey(label: GoalStrategyLabel): string {
    switch (label) {
      case GoalStrategyLabel.Conservative:
        return 'StrategyConservative';
      case GoalStrategyLabel.Fast:
        return 'StrategyFast';
      default:
        return 'StrategyRecommended';
    }
  }
}
