import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../bases/base/base-service';
import { ResultEntity } from '../models/result-entity.model';
import {
  CardPurchaseResponse,
  ChangeCardPurchaseAmountRequest,
  CreateCardPurchaseRequest,
  DeactivateCardPurchaseRequest,
  UpdateCardPurchaseRequest,
} from '../models/card/card-purchase';
import { CardPurchasePreviewResponse } from '../models/card/card-purchase-preview-response.model';
import { CreateCardPurchaseRangeRequest } from '../models/card/create-card-purchase-range-request.model';
import { CreateCardPurchaseRangeResponse } from '../models/card/create-card-purchase-range-response.model';
import { ParseCardPurchasesFromTextRequest } from '../models/card/parse-card-purchases-from-text-request.model';

@Injectable({ providedIn: 'root' })
export class CardPurchaseService extends BaseService {
  private apiUrl = this.url + '/card-purchases';

  create(request: CreateCardPurchaseRequest): Observable<ResultEntity<CardPurchaseResponse>> {
    return this.http.post<ResultEntity<CardPurchaseResponse>>(this.apiUrl, request);
  }

  createRange(
    request: CreateCardPurchaseRangeRequest,
  ): Observable<ResultEntity<CreateCardPurchaseRangeResponse>> {
    return this.http.post<ResultEntity<CreateCardPurchaseRangeResponse>>(
      `${this.apiUrl}/CreateRange`,
      request,
    );
  }

  parseText(
    request: ParseCardPurchasesFromTextRequest,
  ): Observable<ResultEntity<CardPurchasePreviewResponse>> {
    return this.http.post<ResultEntity<CardPurchasePreviewResponse>>(
      `${this.apiUrl}/ParseText`,
      request,
    );
  }

  import(
    file: File,
    creditCardId: number,
    useAi: boolean,
  ): Observable<ResultEntity<CardPurchasePreviewResponse>> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('creditCardId', String(creditCardId));
    formData.append('useAi', String(useAi));

    return this.http.post<ResultEntity<CardPurchasePreviewResponse>>(
      `${this.apiUrl}/Import`,
      formData,
    );
  }

  update(request: UpdateCardPurchaseRequest): Observable<ResultEntity<CardPurchaseResponse>> {
    return this.http.put<ResultEntity<CardPurchaseResponse>>(this.apiUrl, request);
  }

  deactivate(request: DeactivateCardPurchaseRequest): Observable<ResultEntity<CardPurchaseResponse>> {
    return this.http.delete<ResultEntity<CardPurchaseResponse>>(this.apiUrl, { body: request });
  }

  changeAmount(
    request: ChangeCardPurchaseAmountRequest,
  ): Observable<ResultEntity<CardPurchaseResponse>> {
    return this.http.put<ResultEntity<CardPurchaseResponse>>(`${this.apiUrl}/amount`, request);
  }
}
