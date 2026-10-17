import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { Base } from '../../../core/bases/base/base';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';
import { CategoryItemResponse } from '../../../core/models/config/category-item/category-item-response.model';
import { CardPurchasePreviewResponse } from '../../../core/models/card/card-purchase-preview-response.model';
import { CreateCardPurchaseRangeItem } from '../../../core/models/card/create-card-purchase-range-item.model';
import { CardPurchaseService } from '../../../core/services/card-purchase.service';
import { CategoryItemService } from '../../../core/services/category-item.service';
import { MoneyInputDirective } from '../../../shared/directives/money-input.directive';

export interface CardPurchasePreviewModalData {
  creditCardId: number;
  preview: CardPurchasePreviewResponse;
  categories: CategoryResponse[];
}

interface PreviewRow {
  include: boolean;
  purchaseDate: string;
  description: string;
  totalAmount: string;
  installmentsCount: number;
  categoryId: number | null;
  categoryItemId: number | null;
  classificationSource: string | null;
  possibleDuplicate: boolean;
}

@Component({
  selector: 'app-card-purchase-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DragDropModule,
    MoneyInputDirective,
  ],
  templateUrl: './card-purchase-preview-modal.html',
  styleUrls: ['./card-purchase-preview-modal.scss', '../../../../styles/modal-register.scss'],
})
export class CardPurchasePreviewModal extends Base implements OnInit {
  readonly data = inject<CardPurchasePreviewModalData>(MAT_DIALOG_DATA);

  private dialogRef = inject(MatDialogRef<CardPurchasePreviewModal, boolean>);
  private purchaseService = inject(CardPurchaseService);
  private categoryItemService = inject(CategoryItemService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  rows: PreviewRow[] = [];
  subcategories: CategoryItemResponse[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.rows = this.data.preview.purchases.map((p) => ({
      include: !p.possibleDuplicate,
      purchaseDate: p.purchaseDate.substring(0, 10),
      description: p.description,
      totalAmount: String(p.totalAmount),
      installmentsCount: p.installmentsCount,
      categoryId: p.categoryId,
      categoryItemId: p.categoryItemId,
      classificationSource: p.classificationSource,
      possibleDuplicate: p.possibleDuplicate,
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

  subcategoriesOf(categoryId: number | null): CategoryItemResponse[] {
    if (!categoryId) return [];
    return this.subcategories.filter((s) => s.categoryId === Number(categoryId));
  }

  onCategoryChange(row: PreviewRow): void {
    row.categoryItemId = null;
    row.classificationSource = null;
  }

  addRow(): void {
    this.rows = [
      {
        include: true,
        purchaseDate: new Date().toISOString().substring(0, 10),
        description: '',
        totalAmount: '',
        installmentsCount: 1,
        categoryId: null,
        categoryItemId: null,
        classificationSource: null,
        possibleDuplicate: false,
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
      this.toastr.warning(this.translate('SelectAtLeastOnePurchase'));
      return;
    }

    const purchases: CreateCardPurchaseRangeItem[] = included.map((r) => ({
      description: r.description.trim(),
      totalAmount: this.parseAmount(r.totalAmount),
      purchaseDate: r.purchaseDate,
      installmentsCount: Number(r.installmentsCount),
      categoryId: r.categoryId ? Number(r.categoryId) : null,
      categoryItemId: r.categoryItemId ? Number(r.categoryItemId) : null,
    }));

    this.isLoading = true;

    this.purchaseService
      .createRange({ creditCardId: this.data.creditCardId, purchases })
      .subscribe({
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

  private isValid(row: PreviewRow): boolean {
    const installments = Number(row.installmentsCount);

    return (
      row.description.trim().length > 0 &&
      row.description.trim().length <= 60 &&
      /^\d{4}-\d{2}-\d{2}$/.test(row.purchaseDate) &&
      this.parseAmount(row.totalAmount) > 0 &&
      Number.isInteger(installments) &&
      installments >= 1 &&
      installments <= 48
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
