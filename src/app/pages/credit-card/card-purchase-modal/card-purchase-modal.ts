import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Base } from '../../../core/bases/base/base';
import { CreditCardResponse } from '../../../core/models/credit-card/credit-card';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';

@Component({
  selector: 'app-card-purchase-modal',
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
  templateUrl: './card-purchase-modal.html',
  styleUrls: ['./card-purchase-modal.scss', '../../../../styles/modal-register.scss'],
})
export class CardPurchaseModal extends Base {
  form: FormGroup;
  title = 'NewPurchase';
  isEditMode = false;

  cards: CreditCardResponse[] = [];
  categories: CategoryResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CardPurchaseModal>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cards: CreditCardResponse[];
      categories: CategoryResponse[];
      creditCardId?: number | null;
      purchase?: { id: number; description: string; categoryId: number | null } | null;
    },
  ) {
    super();
    this.cards = data.cards ?? [];
    this.categories = data.categories ?? [];
    this.isEditMode = !!data.purchase;

    this.form = this.fb.group({
      creditCardId: [data.creditCardId ?? null, Validators.required],
      description: ['', Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(0.01)]],
      purchaseDate: [this.todayIso(), Validators.required],
      installmentsCount: [1, [Validators.required, Validators.min(1)]],
      categoryId: [null],
    });

    if (data.purchase) {
      this.title = 'Edit';
      this.form.patchValue({
        description: data.purchase.description,
        categoryId: data.purchase.categoryId,
      });
      this.form.get('creditCardId')?.disable();
      this.form.get('totalAmount')?.disable();
      this.form.get('purchaseDate')?.disable();
      this.form.get('installmentsCount')?.disable();
    }
  }

  private todayIso(): string {
    return new Date().toISOString().substring(0, 10);
  }

  save() {
    if (this.form.valid) {
      if (this.isEditMode) {
        this.dialogRef.close({
          description: this.form.value.description,
          categoryId: this.form.value.categoryId,
        });
        return;
      }
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
