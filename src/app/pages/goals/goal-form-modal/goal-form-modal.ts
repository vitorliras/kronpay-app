import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Base } from '../../../core/bases/base/base';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';
import { FinancialGoalResponse } from '../../../core/models/goals/financial-goal-response.model';
import { CategoryBudgetGoalResponse } from '../../../core/models/goals/category-budget-goal-response.model';
import { GoalPriority } from '../../../core/models/goals/goal-priority.model';

export type GoalFormResult =
  | { type: 'financial'; value: any }
  | { type: 'category'; value: any };

@Component({
  selector: 'app-goal-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './goal-form-modal.html',
  styleUrls: ['./goal-form-modal.scss', '../../../../styles/modal-register.scss'],
})
export class GoalFormModal extends Base {
  editing: boolean;
  goalType: 'financial' | 'category';
  categories: CategoryResponse[] = [];

  financialForm: FormGroup;
  categoryForm: FormGroup;

  priorities = [
    { value: GoalPriority.Low, label: 'PriorityLow' },
    { value: GoalPriority.Medium, label: 'PriorityMedium' },
    { value: GoalPriority.High, label: 'PriorityHigh' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GoalFormModal>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type?: 'financial' | 'category';
      financialGoal?: FinancialGoalResponse | null;
      categoryGoal?: CategoryBudgetGoalResponse | null;
      categories: CategoryResponse[];
    },
  ) {
    super();

    this.categories = (data.categories ?? []).filter((c) => c.codTypeTransaction === 'E');
    this.editing = !!(data.financialGoal || data.categoryGoal);
    this.goalType = data.financialGoal ? 'financial' : data.categoryGoal ? 'category' : data.type ?? 'financial';

    const fg = data.financialGoal;
    this.financialForm = this.fb.group({
      id: [fg?.id ?? null],
      description: [fg?.description ?? '', [Validators.required, Validators.maxLength(200)]],
      targetAmount: [fg?.targetAmount ?? null, [Validators.required, Validators.min(0.01)]],
      targetDate: [this.toIso(fg?.targetDate), Validators.required],
      priority: [fg?.priority ?? GoalPriority.Medium, Validators.required],
    });

    const cg = data.categoryGoal;
    this.categoryForm = this.fb.group({
      id: [cg?.id ?? null],
      categoryId: [cg?.categoryId ?? null, Validators.required],
      monthlyLimit: [cg?.monthlyLimit ?? null, [Validators.required, Validators.min(0.01)]],
      priority: [cg?.priority ?? GoalPriority.Medium, Validators.required],
    });
  }

  selectType(type: 'financial' | 'category') {
    if (this.editing) return;
    this.goalType = type;
  }

  private toIso(value?: string | null): string | null {
    return value ? value.substring(0, 10) : null;
  }

  save() {
    const form = this.goalType === 'financial' ? this.financialForm : this.categoryForm;

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const result: GoalFormResult = { type: this.goalType, value: form.value } as GoalFormResult;
    this.dialogRef.close(result);
  }

  close() {
    this.dialogRef.close();
  }
}
