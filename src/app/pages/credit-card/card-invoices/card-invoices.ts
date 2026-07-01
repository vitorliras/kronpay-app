import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  styleUrls: ['./card-invoices.scss', '../../../../styles/card-invoices.scss'],
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

  cards: CreditCardResponse[] = [];
  categories: CategoryResponse[] = [];
  paymentMethods: PaymentMethodResponse[] = [];
  invoices: CardInvoiceResponse[] = [];
  items: CardInstallmentResponse[] = [];
  summary: CreditCardSummaryResponse | null = null;

  creditCardId: number | null = null;
  selectedInvoiceId: number | null = null;
  payingInvoice: CardInvoiceResponse | null = null;
  selectedPaymentMethodId: number | null = null;
  isLoading = false;

  private months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  ngOnInit(): void {
    this.loadCards();
    this.loadCategories();
    this.loadPaymentMethods();
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
    this.items = [];
    this.selectedInvoiceId = null;
    this.payingInvoice = null;

    if (!this.creditCardId) return;

    this.isLoading = true;

    this.invoiceService.getSummary(this.creditCardId).subscribe((res) => {
      if (res.isSuccess) this.summary = res.value ?? null;
      this.cdr.detectChanges();
    });

    this.invoiceService.getByCard(this.creditCardId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.invoices = (res.value ?? []).sort(
            (a, b) => a.referenceYear - b.referenceYear || a.referenceMonth - b.referenceMonth,
          );
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      },
    });
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
    const arr = this.months;
    return arr[(month - 1) % 12].toUpperCase() ?? '';
  }

  // retornam chaves de tradução (usadas como t[...] no template)
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
