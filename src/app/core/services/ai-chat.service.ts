import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../bases/base/base-service';
import { AiChatRequest } from '../models/ai-chat/ai-chat-request.model';
import { AiChatResponse } from '../models/ai-chat/ai-chat-response.model';
import { AiChatStartersResponse } from '../models/ai-chat/ai-chat-starters-response.model';
import { ResultEntity } from '../models/result-entity.model';

@Injectable({ providedIn: 'root' })
export class AiChatService extends BaseService {
  private apiUrl = this.url + '/ai/chat';

  send(request: AiChatRequest): Observable<ResultEntity<AiChatResponse>> {
    return this.http.post<ResultEntity<AiChatResponse>>(this.apiUrl, request);
  }

  getStarters(): Observable<ResultEntity<AiChatStartersResponse>> {
    return this.http.get<ResultEntity<AiChatStartersResponse>>(`${this.apiUrl}/starters`);
  }
}
