export interface TransactionDraft {
  description: string;
  amount: number;
  date: string;
  type: string;
  paymentMethodId: number | null;
  categoryId: number | null;
  categoryItemId: number | null;
  classificationSource: string | null;
  duplicateKind: string | null;
  isCardInvoicePayment: boolean;
}
