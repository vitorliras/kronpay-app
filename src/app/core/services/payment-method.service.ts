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
  private apiUrl = environment.apiUrl+ '/paymentmethods';

  getAll(): Observable<ResultEntity<PaymentMethodResponse[]>> {
    return this.http.get<ResultEntity<PaymentMethodResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ResultEntity<PaymentMethodResponse>> {
    return this.http.get<ResultEntity<PaymentMethodResponse>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreatePaymentMethodRequest): Observable<ResultEntity<PaymentMethodResponse>> {
    return this.http.post<ResultEntity<PaymentMethodResponse>>(this.apiUrl, request);
  }

  update(request: UpdatePaymentMethodRequest): Observable<ResultEntity<PaymentMethodResponse>> {
    return this.http.put<ResultEntity<PaymentMethodResponse>>(this.apiUrl, request);
  }

  deactivate(request: PaymentMethodIdRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.apiUrl, {
      body: request,
    });
  }

  deactivateRange(request: DeactivatePaymentMethodSelectRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.apiUrl + '/DeactivateRange', {
      body: request,
    });
  }
}
