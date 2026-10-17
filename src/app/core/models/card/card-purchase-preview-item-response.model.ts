export interface CardPurchasePreviewItemResponse {
  purchaseDate: string;
  description: string;
  totalAmount: number;
  installmentsCount: number;
  categoryId: number | null;
  categoryItemId: number | null;
  classificationSource: string | null;
  possibleDuplicate: boolean;
}
