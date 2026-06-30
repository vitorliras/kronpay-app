import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../bases/base/base-service';
import { ResultEntity } from '../models/result-entity.model';
import {
  CardPurchaseResponse,
  CreateCardPurchaseRequest,
  DeactivateCardPurchaseRequest,
  UpdateCardPurchaseRequest,
} from '../models/card/card-purchase';

@Injectable({ providedIn: 'root' })
export class CardPurchaseService extends BaseService {
  private apiUrl = this.url + '/card-purchases';

  create(request: CreateCardPurchaseRequest): Observable<ResultEntity<CardPurchaseResponse>> {
    return this.http.post<ResultEntity<CardPurchaseResponse>>(this.apiUrl, request);
  }

  update(request: UpdateCardPurchaseRequest): Observable<ResultEntity<CardPurchaseResponse>> {
    return this.http.put<ResultEntity<CardPurchaseResponse>>(this.apiUrl, request);
  }

  deactivate(request: DeactivateCardPurchaseRequest): Observable<ResultEntity<CardPurchaseResponse>> {
    return this.http.delete<ResultEntity<CardPurchaseResponse>>(this.apiUrl, { body: request });
  }
}
