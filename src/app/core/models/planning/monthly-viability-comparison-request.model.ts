export interface MonthlyViabilityComparisonRequest {
  amount: number;
  installment: boolean;
  installmentsCount: number;
  creditCardId: number | null;
  horizonMonths: number | null;
  safetyReserve: number | null;
}
