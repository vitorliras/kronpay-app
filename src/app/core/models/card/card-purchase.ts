export interface CreateCardPurchaseRequest {
  creditCardId: number;
  description: string;
  totalAmount: number;
  purchaseDate: string;
  installmentsCount: number;
  categoryId?: number | null;
  categoryItemId?: number | null;
}

export interface UpdateCardPurchaseRequest {
  id: number;
  description: string;
  categoryId?: number | null;
  categoryItemId?: number | null;
}

export interface DeactivateCardPurchaseRequest {
  id: number;
}

export interface CardPurchaseResponse {
  id: number;
  description: string;
  totalAmount: number;
  installmentsCount: number;
}
