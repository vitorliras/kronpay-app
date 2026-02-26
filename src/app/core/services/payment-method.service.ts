import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResultEntity } from '../models/result-entity.model';
import {
  CreatePaymentMethodRequest,
  DeactivatePaymentMethodSelectRequest,
  PaymentMethodIdRequest,
  PaymentMethodResponse,
  UpdatePaymentMethodRequest,
} from '../models/config/payment-method/payment-method.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private baseUrl = `${this.apiUrl}/paymentmethods`;

  getAll(): Observable<ResultEntity<PaymentMethodResponse[]>> {
    return this.http.get<ResultEntity<PaymentMethodResponse[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ResultEntity<PaymentMethodResponse>> {
    return this.http.get<ResultEntity<PaymentMethodResponse>>(`${this.baseUrl}/${id}`);
  }

  create(request: CreatePaymentMethodRequest): Observable<ResultEntity<PaymentMethodResponse>> {
    return this.http.post<ResultEntity<PaymentMethodResponse>>(this.baseUrl, request);
  }

  update(request: UpdatePaymentMethodRequest): Observable<ResultEntity<PaymentMethodResponse>> {
    return this.http.put<ResultEntity<PaymentMethodResponse>>(this.baseUrl, request);
  }

  deactivate(request: PaymentMethodIdRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.baseUrl, {
      body: request,
    });
  }

  deactivateRange(request: DeactivatePaymentMethodSelectRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.baseUrl + '/DeactivateRange', {
      body: request,
    });
  }
}
