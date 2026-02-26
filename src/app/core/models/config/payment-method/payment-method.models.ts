export interface CreatePaymentMethodRequest {
  description: string;

}

export interface UpdatePaymentMethodRequest {
  id: number;
  description: string;

}

export interface PaymentMethodIdRequest {
  id: number;

}

export interface GetAllPaymentMethodsRequest {

}

export interface PaymentMethodResponse {
  id: number;
  description: string;
  isActive: boolean;
}

export interface DeactivatePaymentMethodSelectRequest {
  paymentMethods: PaymentMethodIdRequest[];
}

