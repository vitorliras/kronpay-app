import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../bases/base/base-service';
import { ResultEntity } from '../models/result-entity.model';
import {
  CardInstallmentResponse,
  CardInvoiceResponse,
  CreditCardSummaryResponse,
  PayCardInvoiceRequest,
} from '../models/card/card-invoice';

@Injectable({ providedIn: 'root' })
export class CardInvoiceService extends BaseService {
  private apiUrl = this.url + '/card-invoices';

  getSummary(creditCardId: number): Observable<ResultEntity<CreditCardSummaryResponse>> {
    const params = new HttpParams().set('creditCardId', creditCardId);
    return this.http.get<ResultEntity<CreditCardSummaryResponse>>(`${this.apiUrl}/summary`, {
      params,
    });
  }

  getByCard(creditCardId: number): Observable<ResultEntity<CardInvoiceResponse[]>> {
    const params = new HttpParams().set('creditCardId', creditCardId);
    return this.http.get<ResultEntity<CardInvoiceResponse[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ResultEntity<CardInvoiceResponse>> {
    return this.http.get<ResultEntity<CardInvoiceResponse>>(`${this.apiUrl}/${id}`);
  }

  getItems(id: number): Observable<ResultEntity<CardInstallmentResponse[]>> {
    return this.http.get<ResultEntity<CardInstallmentResponse[]>>(`${this.apiUrl}/${id}/items`);
  }

  pay(request: PayCardInvoiceRequest): Observable<ResultEntity<CardInvoiceResponse>> {
    return this.http.post<ResultEntity<CardInvoiceResponse>>(`${this.apiUrl}/pay`, request);
  }
}
