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
  selector: 'app-goal-retry-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './goal-retry-modal.html',
  styleUrls: ['./goal-retry-modal.scss', '../../../../styles/modal-register.scss'],
})
export class GoalRetryModal extends Base {
  form: FormGroup;
  minDate = new Date(Date.now() + 86400000).toISOString().substring(0, 10);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GoalRetryModal>,
    @Inject(MAT_DIALOG_DATA) public data: { goal: FinancialGoalResponse },
  ) {
    super();

    this.form = this.fb.group({
      newTargetDate: [null, Validators.required],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.value.newTargetDate as string);
  }

  close(): void {
    this.dialogRef.close();
  }
}
