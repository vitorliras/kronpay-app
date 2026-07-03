export interface ViabilityFindingResponse {
  rule: string;
  status: string;
  penalty: number;
  isVeto: boolean;
  messageKey: string;
  year: number | null;
  month: number | null;
  args: { [key: string]: string };
}
