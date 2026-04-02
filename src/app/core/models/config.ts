export interface Config {
  apiUrl: string;
  headers: {
    [key: string]: string;
  };
  features: {
    enableAiImport: boolean;
  };
}
