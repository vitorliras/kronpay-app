import { Injectable } from '@angular/core';
import { BaseService } from '../bases/base/base-service';
import { ConnectorsResponse } from '../models/bank/connectors-response-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiBankService extends BaseService {
  private apiUrl = this.url + '/pluggy';

  getBanks(): Observable<ConnectorsResponse> {
    return this.http.get<ConnectorsResponse>(`${this.apiUrl}/connectors/`);
  }

  getToken(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/connect-token/`);
  }

}
