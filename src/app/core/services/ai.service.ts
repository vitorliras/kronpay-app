import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AiStatusResponse } from '../models/ai/ai-status-response.model';
import { AiUsageSummaryResponse } from '../models/ai/ai-usage-summary-response.model';
import { ResultEntity } from '../models/result-entity.model';
import { BaseService } from '../bases/base/base-service';

@Injectable({
  providedIn: 'root',
})
export class AiService extends BaseService {
  private apiUrl = this.url + '/ai';

  getStatus(): Observable<ResultEntity<AiStatusResponse>> {
    return this.http.get<ResultEntity<AiStatusResponse>>(`${this.apiUrl}/status`);
  }

  getCurrentMonthUsage(): Observable<ResultEntity<AiUsageSummaryResponse>> {
    return this.http.get<ResultEntity<AiUsageSummaryResponse>>(`${this.apiUrl}/usage`);
  }
}
