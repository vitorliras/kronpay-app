export interface SimulatePurchaseRequest {
  amount: number;
  purchaseDate: string;
  installment: boolean;
  installmentsCount: number;
  creditCardId: number | null;
  horizonMonths: number | null;
  safetyReserve: number | null;
}
