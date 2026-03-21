export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  transactionDate: Date;
  description: string;
  codTypeTransaction: string;
  status: string;
  categoryId?: number | null;
  categoryItemId?: number | null;
  installments?: number | null;
  installmentsText?: string | null;
  idPaymentMethod?: number | null;
  transactionGroupId?: number | null;
  typeGroup?: string | null;
  createdAt: Date;
}
