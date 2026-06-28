import { Injectable } from '@angular/core';
import { BaseService } from '../bases/base/base-service';
import { ResultEntity } from '../models/result-entity.model';
import { Observable } from 'rxjs';
import { CreateCreditCardRequest, CreditCardIdRequest, CreditCardResponse, UpdateCreditCardRequest } from '../models/credit-card/credit-card';
import { DeactivateCategoryRequest } from '../models/config/category/deactivate-category-request.model';

@Injectable({
  providedIn: 'root',
})
export class CreditCardService extends BaseService {
  private apiUrl = this.url + '/creditcards';

  getAll(): Observable<ResultEntity<CreditCardResponse[]>> {
    return this.http.get<ResultEntity<CreditCardResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ResultEntity<CreditCardResponse>> {
    return this.http.get<ResultEntity<CreditCardResponse>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCreditCardRequest): Observable<ResultEntity<CreditCardResponse>> {
    return this.http.post<ResultEntity<CreditCardResponse>>(this.apiUrl, request);
  }

  update(request: UpdateCreditCardRequest): Observable<ResultEntity<CreditCardResponse>> {
    return this.http.put<ResultEntity<CreditCardResponse>>(this.apiUrl, request);
  }

  deactivate(request: CreditCardIdRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.apiUrl, {
      body: request,
    });
  }

  deactivateRange(request: DeactivateCategoryRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.apiUrl, {
      body: request,
    });
  }
}
