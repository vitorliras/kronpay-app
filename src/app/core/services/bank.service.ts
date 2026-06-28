import { Injectable } from '@angular/core';
import { BaseService } from '../bases/base/base-service';
import { Bank } from '../models/bank/bank';
import { Observable } from 'rxjs';
import { ResultEntity } from '../models/result-entity.model';

@Injectable({
  providedIn: 'root',
})
export class BankService extends BaseService {
  private apiUrl = this.url + '/bank';

  getAll(): Observable<ResultEntity<Bank[]>> {
    return this.http.get<ResultEntity<Bank[]>>(`${this.apiUrl}`);
  }


}
