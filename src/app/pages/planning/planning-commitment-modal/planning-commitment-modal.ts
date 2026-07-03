import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Base } from '../../../core/bases/base/base';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';
import { PlannedCommitmentResponse } from '../../../core/models/planning/planned-commitment-response.model';

@Component({
  selector: 'app-planning-commitment-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
  ],
  templateUrl: './planning-commitment-modal.html',
  styleUrls: ['./planning-commitment-modal.scss', '../../../../styles/modal-register.scss'],
})
export class PlanningCommitmentModal extends Base {
  form: FormGroup;
  editing: boolean;
  categories: CategoryResponse[] = [];

  directions = [
    { value: 'I', label: 'Income' },
    { value: 'O', label: 'Expense' },
  ];

  periodicities = [
    { value: 'M', label: 'Monthly' },
    { value: 'S', label: 'Weekly' },
    { value: 'A', label: 'Yearly' },
    { value: 'U', label: 'Once' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PlanningCommitmentModal>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      categories: CategoryResponse[];
      commitment?: PlannedCommitmentResponse | null;
    },
  ) {
    super();
    this.categories = data.categories ?? [];
    this.editing = !!data.commitment;

    const c = data.commitment;

    this.form = this.fb.group({
      id: [c?.id ?? null],
      description: [c?.description ?? '', [Validators.required, Validators.maxLength(60)]],
      amount: [c?.amount ?? null, [Validators.required, Validators.min(0.01)]],
      direction: [c?.direction ?? 'O', Validators.required],
      periodicity: [c?.periodicity ?? 'M', Validators.required],
      startDate: [this.toIso(c?.startDate) ?? this.todayIso(), Validators.required],
      endDate: [this.toIso(c?.endDate) ?? null],
      categoryId: [c?.categoryId ?? null],
    });
  }

  private todayIso(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private toIso(value?: string | null): string | null {
    return value ? value.substring(0, 10) : null;
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
