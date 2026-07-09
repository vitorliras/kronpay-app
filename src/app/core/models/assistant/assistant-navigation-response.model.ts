export interface AssistantNavigationResponse {
  path: string;
  queryParams: Record<string, string>;
  autoNavigate: boolean;
  labelKey: string;
}
