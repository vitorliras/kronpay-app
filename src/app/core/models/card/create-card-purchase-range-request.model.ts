import { CreateCardPurchaseRangeItem } from './create-card-purchase-range-item.model';

export interface CreateCardPurchaseRangeRequest {
  creditCardId: number;
  purchases: CreateCardPurchaseRangeItem[];
}
