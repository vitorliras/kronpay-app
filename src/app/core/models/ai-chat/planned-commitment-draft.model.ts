export interface PlannedCommitmentDraft {
  description: string;
  amount: number;
  direction: string;
  periodicity: string;
  startDate: string;
  endDate: string | null;
  categoryId: number | null;
}
