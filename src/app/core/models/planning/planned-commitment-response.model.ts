export interface PlannedCommitmentResponse {
  id: number;
  description: string;
  amount: number;
  direction: string;
  periodicity: string;
  startDate: string;
  endDate: string | null;
  categoryId: number | null;
  active: boolean;
}
