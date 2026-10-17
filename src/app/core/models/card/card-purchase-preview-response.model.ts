import { CardPurchasePreviewItemResponse } from './card-purchase-preview-item-response.model';

export interface CardPurchasePreviewResponse {
  totalRead: number;
  skipped: number;
  purchases: CardPurchasePreviewItemResponse[];
}
