import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Base } from '../../../core/bases/base/base';
import { TransactionDraft } from '../../../core/models/ai-chat/transaction-draft.model';
import { CategoryItemResponse } from '../../../core/models/config/category-item/category-item-response.model';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';
import { PaymentMethodResponse } from '../../../core/models/config/payment-method/payment-method.models';
import { Transaction } from '../../../core/models/transaction/transaction.model';
import { CategoryItemService } from '../../../core/services/category-item.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { MoneyInputDirective } from '../../../shared/directives/money-input.directive';

export interface TransactionPreviewModalData {
  drafts: TransactionDraft[];
  categories: CategoryResponse[];
  paymentMethods: PaymentMethodResponse[];
}

interface PreviewRow {
  include: boolean;
  date: string;
  description: string;
  type: string;
  amount: string;
  paymentMethodId: number | null;
  categoryId: number | null;
  categoryItemId: number | null;
  status: string;
  classificationSource: string | null;
}

@Component({
  selector: 'app-transaction-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DragDropModule,
    MoneyInputDirective,
  ],
  templateUrl: './transaction-preview-modal.html',
  styleUrls: ['./transaction-preview-modal.scss', '../../../../styles/modal-register.scss'],
})
export class TransactionPreviewModal extends Base implements OnInit {
  readonly data = inject<TransactionPreviewModalData>(MAT_DIALOG_DATA);

  private dialogRef = inject(MatDialogRef<TransactionPreviewModal, boolean>);
  private transactionService = inject(TransactionService);
  private categoryItemService = inject(CategoryItemService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  rows: PreviewRow[] = [];
  subcategories: CategoryItemResponse[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.rows = this.data.drafts.map((d) => ({
      include: true,
      date: d.date.substring(0, 10),
      description: d.description,
      type: d.type,
      amount: String(d.amount),
      paymentMethodId: d.paymentMethodId,
      categoryId: d.categoryId,
      categoryItemId: d.categoryItemId,
      status: this.defaultStatus(d.date),
      classificationSource: d.classificationSource,
    }));

    this.categoryItemService.getAllByUser().subscribe((res) => {
      if (res.isSuccess) {
        this.subcategories = res.value ?? [];
        this.cdr.detectChanges();
      }
    });
  }

  get includedCount(): number {
    return this.rows.filter((r) => r.include).length;
  }

  categoriesOf(type: string): CategoryResponse[] {
    return this.data.categories.filter((c) => c.codTypeTransaction === type);
  }

  subcategoriesOf(categoryId: number | null): CategoryItemResponse[] {
    if (!categoryId) return [];
    return this.subcategories.filter((s) => s.categoryId === Number(categoryId));
  }

  onTypeChange(row: PreviewRow): void {
    row.categoryId = null;
    row.categoryItemId = null;
    row.classificationSource = null;
  }

  onCategoryChange(row: PreviewRow): void {
    row.categoryItemId = null;
    row.classificationSource = null;
  }

  onDateChange(row: PreviewRow): void {
    row.status = this.defaultStatus(row.date);
  }

  addRow(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.rows = [
      {
        include: true,
        date: today,
        description: '',
        type: 'E',
        amount: '',
        paymentMethodId: null,
        categoryId: null,
        categoryItemId: null,
        status: 'P',
        classificationSource: null,
      },
      ...this.rows,
    ];
  }

  removeRow(row: PreviewRow): void {
    this.rows = this.rows.filter((r) => r !== row);
  }

  save(): void {
    const included = this.rows.filter((r) => r.include);

    if (included.length === 0 || included.some((r) => !this.isValid(r))) {
      this.toastr.warning(this.translate('SaveAttachInvalid'));
      return;
    }

    const transactions: Transaction[] = included.map((r) => ({
      id: 0,
      userId: 0,
      amount: this.parseAmount(r.amount),
      transactionDate: new Date(`${r.date}T00:00:00`),
      description: r.description.trim(),
      codTypeTransaction: r.type,
      status: r.status,
      categoryId: r.categoryId ? Number(r.categoryId) : null,
      categoryItemId: r.categoryItemId ? Number(r.categoryItemId) : null,
      installments: null,
      installmentsText: null,
      idPaymentMethod: Number(r.paymentMethodId),
      transactionGroupId: null,
      typeGroup: null,
      createdAt: new Date(),
    }));

    this.isLoading = true;

    this.transactionService.createRange({ transactions }).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.dialogRef.close(true);
          return;
        }

        this.toastr.warning(res.message);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private defaultStatus(date: string): string {
    return date.substring(0, 10) <= new Date().toISOString().substring(0, 10) ? 'P' : 'O';
  }

  private isValid(row: PreviewRow): boolean {
    return (
      row.description.trim().length > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
      !!row.type &&
      !!row.paymentMethodId &&
      this.parseAmount(row.amount) > 0
    );
  }

  private parseAmount(value: string): number {
    const normalized = String(value ?? '').trim().replace(',', '.');
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private translate(key: string): string {
    let result = key;
    this.translations$.subscribe((t) => (result = t[key] ?? key)).unsubscribe();
    return result;
  }
}
