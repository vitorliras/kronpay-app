export interface CreateCreditCardRequest {
  description: string;
  dueDay: number;
  closingDay: number;
  bankId: number;
  creditLimit: number;
}

export interface CreditCardIdRequest {
  id: number;
}

export interface CreditCardResponse {
  id: number;
  description: string;
  dueDay: number;
  closingDay: number;
  creditLimit: number;
  bankId: number;
  active: boolean;
}

export interface UpdateCreditCardRequest {
  id: number;
  description: string;
  bankId: number;
  dueDay: number;
  closingDay: number;
  creditLimit: number;
}
