import { PaymentMethodOption } from './payment-method-option.model';

export interface InvoicePaymentProposal {
  cardInvoiceId: number;
  creditCardId: number;
  cardName: string;
  referenceYear: number;
  referenceMonth: number;
  amount: number;
  dueDate: string;
  paymentMethods: PaymentMethodOption[];
}
