export interface ChatAttachmentSummary {
  id: string;
  fileName: string;
  transactionCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  totalIncome: number;
  totalExpense: number;
  cardInvoicePaymentCount: number;
  cardInvoicePaymentTotal: number;
}
