import { Transaction } from "./transaction.model";

export interface GetTransactionsByGroupRequest {
  transactionGroupId: number;
}

export interface GetTransactionsByMonthRequest {
  year: number;
  month: number;
}

export interface GetTransactionsByYearRequest {
  year: number;
}

export interface GetTransactionsByDatesRequest {
  startDate: Date;
  endDate?: Date;
}

export interface ChangeStatusTransactionRequest {
  id: number;
  status: string;
}

export interface ChangeStatusTransactionRangeRequest {
  transactions: ChangeStatusTransactionRequest[]
}

export interface DeleteTransactionRequest {
  transactionId: number;
  deleteGroup: boolean;
  fromDate?: Date | null;
}

export interface UpdateTransactionRequest {
  id: number;
  description: string;
  type: string;
  amount: number;
  transactionDate: Date;
  updateGroup: boolean;
  status: string;
  categoryId: number;
  categoryItemId?: number | null;
}

export interface TransactionRangeRequest {
  transactions: readonly Transaction[];
}

export interface DeactivateTransactionSelectRequest {
  transactions: readonly DeactivateTransactionRequest[];
}

export interface DeactivateTransactionRequest {
  id: number;
}

export interface ImportTransactionsFormRequest {
  file: File;
  preview?: boolean;
  useAi?: boolean;
}

export interface UpdtadeRangeTransactionItem {
  id: number;
  amount: number;
  transactionDate: Date;
  description: string;
  codTypeTransaction: string;
  status: string;
  categoryId?: number | null;
  categoryItemId?: number | null;
  idPaymentMethod: number;
}

export interface UpdtadeRangeTransaction {
  transactions: readonly UpdtadeRangeTransactionItem[];
}

export interface CreateTransactionRequest {
  description: string;
  amount: number;
  transactionDate: Date;
  codTypeTransaction: 'E' | 'I' | 'V';
  recurrenceType: 'F' | 'I';
  endDate?: Date;
  installments: number;
  categoryId: number;
  categoryItemId?: number;
  idMethodPayment?: number;
}
