import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Base } from '../../../core/bases/base/base';
import { FinancialGoalResponse } from '../../../core/models/goals/financial-goal-response.model';

@Component({
  selector: 'app-goal-contribution-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './goal-contribution-modal.html',
  styleUrls: ['./goal-contribution-modal.scss', '../../../../styles/modal-register.scss'],
})
export class GoalContributionModal extends Base {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GoalContributionModal>,
    @Inject(MAT_DIALOG_DATA) public data: { goal: FinancialGoalResponse },
  ) {
    super();

    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.value.amount as number);
  }

  close(): void {
    this.dialogRef.close();
  }
}
