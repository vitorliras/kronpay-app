import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Base } from '../../../core/bases/base/base';
import { CreditCardService } from '../../../core/services/credit-card.service';
import { CardInvoiceService } from '../../../core/services/card-invoice.service';
import { CardPurchaseService } from '../../../core/services/card-purchase.service';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { CategoryService } from '../../../core/services/category.service';
import { CardPurchaseModal } from '../card-purchase-modal/card-purchase-modal';
import { CreditCardResponse } from '../../../core/models/credit-card/credit-card';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';
import { PaymentMethodResponse } from '../../../core/models/config/payment-method/payment-method.models';
import {
  CardInstallmentResponse,
  CardInvoiceResponse,
  CreditCardSummaryResponse,
  PayCardInvoiceRequest,
} from '../../../core/models/card/card-invoice';
import { CreateCardPurchaseRequest } from '../../../core/models/card/card-purchase';

@Component({
  selector: 'app-card-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './card-invoices.html',
  styleUrls: [
    './card-invoices.scss',
    '../../../../styles/card-invoices.scss',
    '../../../../styles/buttons.scss',
  ],
})
export class CardInvoicesComponent extends Base implements OnInit {
  private creditCardService = inject(CreditCardService);
  private invoiceService = inject(CardInvoiceService);
  private purchaseService = inject(CardPurchaseService);
  private paymentMethodService = inject(PaymentMethodService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private activatedRoute = inject(ActivatedRoute);

  cards: CreditCardResponse[] = [];
  categories: CategoryResponse[] = [];
  paymentMethods: PaymentMethodResponse[] = [];

  invoices: CardInvoiceResponse[] = []; // lista completa vinda do backend
  overdueInvoices: CardInvoiceResponse[] = [];
  displayedInvoices: CardInvoiceResponse[] = [];
  items: CardInstallmentResponse[] = [];
  summary: CreditCardSummaryResponse | null = null;

  // filtros
  availableYears: number[] = [];
  monthsOfYear: number[] = [];
  filterYear: number | null = null;
  filterMonths: number[] = [];
  monthsList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  creditCardId: number | null = null;
  selectedInvoiceId: number | null = null;
  payingInvoice: CardInvoiceResponse | null = null;
  selectedPaymentMethodId: number | null = null;
  isLoading = false;

  private readonly monthKeys = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  private readonly maxMonths = 12;

  ngOnInit(): void {
    this.loadCards();
    this.loadCategories();
    this.loadPaymentMethods();

    const cardId = Number(this.activatedRoute.snapshot.queryParamMap.get('cardId'));
    if (cardId) {
      this.creditCardId = cardId;
      this.onCardChange();
    }
  }

  loadCards(): void {
    this.creditCardService.getAll().subscribe((res) => {
      if (res.isSuccess) {
        this.cards = res.value ?? [];
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess) {
        this.categories = (res.value ?? []).filter((c) => c.codTypeTransaction === 'E');
      }
    });
  }

  loadPaymentMethods(): void {
    this.paymentMethodService.getAll().subscribe((res) => {
      if (res.isSuccess) {
        this.paymentMethods = res.value ?? [];
      }
    });
  }

  onCardChange(): void {
    this.summary = null;
    this.invoices = [];
    this.overdueInvoices = [];
    this.displayedInvoices = [];
    this.items = [];
    this.selectedInvoiceId = null;
    this.payingInvoice = null;
    this.clearFilters();

    if (!this.creditCardId) return;

    this.isLoading = true;

    this.invoiceService.getSummary(this.creditCardId).subscribe((res) => {
      if (res.isSuccess) this.summary = res.value ?? null;
      this.cdr.detectChanges();
    });

    this.invoiceService.getByCard(this.creditCardId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.invoices = res.isSuccess ? (res.value ?? []) : [];
        this.availableYears = Array.from(new Set(this.invoices.map((i) => i.referenceYear))).sort(
          (a, b) => b - a,
        );
        this.applyView();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyView(): void {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    if (this.filterYear) {
      this.overdueInvoices = [];
      this.displayedInvoices = this.invoices
        .filter(
          (i) =>
            i.referenceYear === this.filterYear &&
            (this.filterMonths.length === 0 || this.filterMonths.includes(i.referenceMonth)),
        )
        .sort((a, b) => this.compAsc(a, b));
      return;
    }

    this.overdueInvoices = this.invoices
      .filter((i) => this.isOverdue(i))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const overdueIds = new Set(this.overdueInvoices.map((i) => i.id));

    this.displayedInvoices = this.invoices
      .filter(
        (i) =>
          !overdueIds.has(i.id) &&
          (i.referenceYear > curYear ||
            (i.referenceYear === curYear && i.referenceMonth >= curMonth)),
      )
      .sort((a, b) => this.compAsc(a, b))
      .slice(0, this.maxMonths);
  }

  private compAsc(a: CardInvoiceResponse, b: CardInvoiceResponse): number {
    return a.referenceYear - b.referenceYear || a.referenceMonth - b.referenceMonth;
  }

  isOverdue(inv: CardInvoiceResponse): boolean {
    if (this.isPaid(inv)) return false;
    const due = new Date(inv.dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  selectYear(year: number): void {
    this.filterYear = this.filterYear === year ? null : year;
    this.filterMonths = [];
    this.monthsOfYear = this.filterYear
      ? Array.from(
          new Set(
            this.invoices.filter((i) => i.referenceYear === this.filterYear).map((i) => i.referenceMonth),
          ),
        ).sort((a, b) => a - b)
      : [];
    this.applyView();
  }

  isMonthAvailable(month: number): boolean {
    return this.monthsOfYear.includes(month);
  }

  toggleMonth(month: number): void {
    if (!this.filterYear || !this.isMonthAvailable(month)) return;
    const idx = this.filterMonths.indexOf(month);
    if (idx >= 0) this.filterMonths.splice(idx, 1);
    else this.filterMonths.push(month);
    this.applyView();
  }

  clearFilters(): void {
    this.filterYear = null;
    this.filterMonths = [];
    this.monthsOfYear = [];
    this.applyView();
  }

  isFilterActive(): boolean {
    return this.filterYear !== null;
  }

  openPurchaseModal(): void {
    const dialogRef = this.dialog.open(CardPurchaseModal, {
      data: {
        cards: this.cards,
        categories: this.categories,
        creditCardId: this.creditCardId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload: CreateCardPurchaseRequest = {
        creditCardId: result.creditCardId,
        description: result.description,
        totalAmount: result.totalAmount,
        purchaseDate: result.purchaseDate,
        installmentsCount: result.installmentsCount,
        categoryId: result.categoryId ?? null,
      };

      this.isLoading = true;
      this.purchaseService.create(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.creditCardId = payload.creditCardId;
            this.onCardChange();
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: () => {
          this.isLoading = false;
        },
      });
    });
  }

  viewItems(invoice: CardInvoiceResponse): void {
    if (this.selectedInvoiceId === invoice.id) {
      this.selectedInvoiceId = null;
      this.items = [];
      return;
    }

    this.selectedInvoiceId = invoice.id;
    this.items = [];
    this.invoiceService.getItems(invoice.id).subscribe((res) => {
      if (res.isSuccess) this.items = res.value ?? [];
      this.cdr.detectChanges();
    });
  }

  editPurchase(item: CardInstallmentResponse): void {
    const dialogRef = this.dialog.open(CardPurchaseModal, {
      data: {
        cards: this.cards,
        categories: this.categories,
        purchase: {
          id: item.cardPurchaseId,
          description: item.purchaseDescription,
          categoryId: item.categoryId ?? null,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.isLoading = true;
      this.purchaseService
        .update({
          id: item.cardPurchaseId,
          description: result.description,
          categoryId: result.categoryId ?? null,
        })
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.isSuccess) {
              this.toastr.success(res.message);
              if (this.selectedInvoiceId) this.reloadItems(this.selectedInvoiceId);
            } else {
              this.toastr.warning(res.message);
            }
          },
          error: () => {
            this.isLoading = false;
          },
        });
    });
  }

  deletePurchase(item: CardInstallmentResponse): void {
    this.confirmModal('Delete', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe(
      (confirmed) => {
        if (!confirmed) return;

        this.isLoading = true;
        this.purchaseService.deactivate({ id: item.cardPurchaseId }).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.isSuccess) {
              this.toastr.success(res.message);
              this.onCardChange();
            } else {
              this.toastr.warning(res.message);
            }
          },
          error: () => {
            this.isLoading = false;
          },
        });
      },
    );
  }

  private reloadItems(invoiceId: number): void {
    this.items = [];
    this.invoiceService.getItems(invoiceId).subscribe((res) => {
      if (res.isSuccess) this.items = res.value ?? [];
      this.cdr.detectChanges();
    });
  }

  startPay(invoice: CardInvoiceResponse): void {
    this.payingInvoice = invoice;
    this.selectedPaymentMethodId = null;
  }

  cancelPay(): void {
    this.payingInvoice = null;
  }

  confirmPay(): void {
    if (!this.payingInvoice) return;

    if (!this.selectedPaymentMethodId) {
      this.messageWarning('SelectPaymentMethod');
      return;
    }

    const payload: PayCardInvoiceRequest = {
      cardInvoiceId: this.payingInvoice.id,
      paymentMethodId: this.selectedPaymentMethodId,
      codTypeTransaction: 'E',
    };

    this.isLoading = true;
    this.invoiceService.pay(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.payingInvoice = null;
          this.onCardChange();
        } else {
          this.toastr.warning(res.message);
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  monthLabel(month: number): string {
    return this.monthKeys[(month - 1) % 12] ?? '';
  }

  statusLabel(status: string): string {
    return status === 'P' ? 'Paid' : status === 'F' ? 'Closed' : 'Open';
  }

  installmentStatusLabel(status: string): string {
    return status === 'Q' ? 'Settled' : status === 'C' ? 'Canceled' : 'Pending';
  }

  isPaid(invoice: CardInvoiceResponse): boolean {
    return invoice.status === 'P';
  }
}
