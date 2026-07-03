export interface ProjectionMonthResponse {
  year: number;
  month: number;
  openingBalance: number;
  inflows: number;
  predictedOutflow: number;
  probableOutflow: number;
  predictedClosing: number;
  probableClosing: number;
}
