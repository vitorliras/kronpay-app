export interface CreateCardPurchaseRangeItem {
  description: string;
  totalAmount: number;
  purchaseDate: string;
  installmentsCount: number;
  categoryId: number | null;
  categoryItemId: number | null;
}
