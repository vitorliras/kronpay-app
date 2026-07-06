import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Base } from '../../../core/bases/base/base';
import { FinancialGoalResponse } from '../../../core/models/goals/financial-goal-response.model';
import { CategoryBudgetGoalResponse } from '../../../core/models/goals/category-budget-goal-response.model';
import { GoalDetailFinancial } from './goal-detail-financial/goal-detail-financial';
import { GoalDetailCategory } from './goal-detail-category/goal-detail-category';

@Component({
  selector: 'app-goal-detail-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, GoalDetailFinancial, GoalDetailCategory],
  templateUrl: './goal-detail-modal.html',
  styleUrls: ['./goal-detail-modal.scss', '../../../../styles/modal-register.scss'],
})
export class GoalDetailModal extends Base {
  constructor(
    private dialogRef: MatDialogRef<GoalDetailModal>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: 'financial' | 'category';
      financialGoal?: FinancialGoalResponse;
      categoryGoal?: CategoryBudgetGoalResponse;
      categoryName?: string;
      activeFinancialGoals?: FinancialGoalResponse[];
    },
  ) {
    super();
  }

  close(): void {
    this.dialogRef.close();
  }
}
