export interface CreditCardSummaryResponse {
  creditCardId: number;
  creditLimit: number;
  usedAmount: number;
  availableAmount: number;
}

export interface CardInvoiceResponse {
  id: number;
  referenceYear: number;
  referenceMonth: number;
  closingDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  paidAt?: string | null;
}

export interface CardInstallmentResponse {
  id: number;
  cardPurchaseId: number;
  purchaseDescription: string;
  installmentNumber: number;
  installmentsCount: number;
  amount: number;
  status: string;
  categoryDescription?: string | null;
}

export interface PayCardInvoiceRequest {
  cardInvoiceId: number;
  paymentMethodId: number;
  codTypeTransaction: string;
}
