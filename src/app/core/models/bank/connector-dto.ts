export interface Connector {
  id: number;
  name: string;
  primaryColor: string;
  institutionUrl: string;
  imageUrl: string;

  country: string;
  type: string;

  hasMFA: boolean;
  oauth: boolean;

  health: ConnectorHealth;

  products: string[];

  isSandbox: boolean;
  isOpenFinance: boolean;

  supportsPaymentInitiation: boolean;
  supportsScheduledPayments: boolean;
  supportsSmartTransfers: boolean;
  supportsBoletoManagement: boolean;
  supportsAutomaticPix: boolean;

  credentials: ConnectorCredential[];
}

export interface ConnectorHealth {
  status: string;
  stage: string | null;
}

export interface ConnectorCredential {
  label: string;
  name: string;
  type: string;

  validation?: string;
  validationMessage?: string;

  placeholder?: string;
  optional: boolean;
}
