export interface AiStatusResponse {
  enabled: boolean;
  provider: string | null;
  model: string | null;
  supportsFiles: boolean;
}
