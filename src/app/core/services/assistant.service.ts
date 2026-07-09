import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../bases/base/base-service';
import { ResultEntity } from '../models/result-entity.model';
import { AskAssistantRequest } from '../models/assistant/ask-assistant-request.model';
import { AssistantNodeResponse } from '../models/assistant/assistant-node-response.model';

@Injectable({ providedIn: 'root' })
export class AssistantService extends BaseService {
  private apiUrl = this.url + '/assistant';

  ask(request: AskAssistantRequest): Observable<ResultEntity<AssistantNodeResponse>> {
    return this.http.post<ResultEntity<AssistantNodeResponse>>(this.apiUrl, request);
  }
}
