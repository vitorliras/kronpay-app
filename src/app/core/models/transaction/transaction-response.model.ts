export interface TransactionRangeResponse {
  AffectedTransactions: number;
}

export interface TransactionResponse {
  id: number;
  Description: string;
  TransactionGroupId: number;
  AffectedTransactions: number;
}

export interface TransactionResponse {
  id: number;
  Description: string;
  TransactionGroupId: number;
  AffectedTransactions: number;
}

export interface ImportedTransactionResponse {
  transactionDate: Date;
  amount: number;
  description: string;
  type: string;
  status: string;
  paymentMethod: number;
  categoryId?: number | null;
  categoryItemId?: number | null;
  transactionGroupId?: number | null;
  id?: number | null;
}

export interface ImportTransactionsResponse {
  totalRead: number;
  totalImported: number;
  totalSkipped: number;
  transactions: ImportedTransactionResponse[];
}
