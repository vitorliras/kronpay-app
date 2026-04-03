import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { ResultEntity } from '../models/result-entity.model';
import {
  ChangeStatusTransactionRangeRequest,
  ChangeStatusTransactionRequest,
  CreateTransactionRequest,
  DeactivateTransactionSelectRequest,
  DeleteTransactionRequest,
  GetTransactionsByGroupRequest,
  GetTransactionsByMonthRequest,
  GetTransactionsByYearRequest,
  ImportTransactionsFormRequest,
  TransactionRangeRequest,
  UpdateTransactionRequest,
  UpdtadeRangeTransaction,
} from '../models/transaction/transaction-request.model';
import { Transaction } from '../models/transaction/transaction.model';
import {
  ImportTransactionsResponse,
  TransactionRangeResponse,
  TransactionResponse,
} from '../models/transaction/transaction-response.model';
import { BaseService } from '../bases/base/base-service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService extends BaseService  {

  private apiUrl = this.url + '/transactions';

  getAllByGroup(request: GetTransactionsByGroupRequest): Observable<ResultEntity<Transaction[]>> {
    const params = new HttpParams().set('transactionGroupId', request.transactionGroupId);

    return this.http.get<ResultEntity<Transaction[]>>(`${this.apiUrl}/GetAllByGroup`, { params });
  }

  getAllByMonth(request: GetTransactionsByMonthRequest): Observable<ResultEntity<Transaction[]>> {
    const params = new HttpParams().set('year', request.year).set('month', request.month);

    return this.http.get<ResultEntity<Transaction[]>>(`${this.apiUrl}/GetAllByMonth`, { params });
  }

  getAllByYear(request: GetTransactionsByYearRequest): Observable<ResultEntity<Transaction[]>> {
    const params = new HttpParams().set('year', request.year);

    return this.http.get<ResultEntity<Transaction[]>>(`${this.apiUrl}/GetAllByYear`, { params });
  }

  create(request: CreateTransactionRequest): Observable<ResultEntity<TransactionResponse>> {
    return this.http.post<ResultEntity<TransactionResponse>>(this.apiUrl, request);
  }

  createRange(
    request: TransactionRangeRequest,
  ): Observable<ResultEntity<TransactionRangeResponse>> {
    return this.http.post<ResultEntity<TransactionRangeResponse>>(
      `${this.apiUrl}/CreateRange`,
      request,
    );
  }

  update(request: UpdateTransactionRequest): Observable<ResultEntity<TransactionResponse>> {
    return this.http.put<ResultEntity<TransactionResponse>>(`${this.apiUrl}/Update`, request);
  }

  UpdateRange(
    request: UpdtadeRangeTransaction,
  ): Observable<ResultEntity<TransactionRangeResponse>> {
    return this.http.put<ResultEntity<TransactionRangeResponse>>(
      `${this.apiUrl}/UpdateRange`,
      request,
    );
  }

  changeStatus(request: ChangeStatusTransactionRequest): Observable<ResultEntity<Transaction>> {
    return this.http.put<ResultEntity<Transaction>>(`${this.apiUrl}/ChangeStatus`, request);
  }

  changeRangeStatus(
    request: ChangeStatusTransactionRangeRequest,
  ): Observable<ResultEntity<TransactionRangeResponse>> {
    return this.http.put<ResultEntity<TransactionRangeResponse>>(
      `${this.apiUrl}/ChangeStatusRange`,
      request,
    );
  }

  delete(request: DeleteTransactionRequest): Observable<ResultEntity<void>> {
    return this.http.request<ResultEntity<void>>('DELETE', `${this.apiUrl}/Delete`, {
      body: request,
    });
  }

  deleteRange(
    request: DeactivateTransactionSelectRequest,
  ): Observable<ResultEntity<TransactionRangeResponse>> {
    return this.http.delete<ResultEntity<TransactionRangeResponse>>(`${this.apiUrl}/DeleteRange`, {
      body: request,
    });
  }

  import(
    request: ImportTransactionsFormRequest,
  ): Observable<ResultEntity<ImportTransactionsResponse>> {
    const formData = new FormData();

    formData.append('file', request.file);
    formData.append('preview', String(request.preview ?? false));
    formData.append('useAi', String(request.useAi ?? false));

    return this.http.post<ResultEntity<ImportTransactionsResponse>>(
      `${this.apiUrl}/Import`,
      formData,
    );
  }
}
