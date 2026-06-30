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
  installmentNumber: number;
  amount: number;
  status: string;
}

export interface PayCardInvoiceRequest {
  cardInvoiceId: number;
  paymentMethodId: number;
  codTypeTransaction: string;
}
