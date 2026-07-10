import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultEntity } from '../../models/result-entity.model';
import { BaseService } from '../../bases/base/base-service';
import { UserRankResponse } from '../../models/gamification/user-rank-response.model';
import { UserBadgeResponse } from '../../models/gamification/user-badge-response.model';
import { MissionProgressResponse } from '../../models/gamification/mission-progress-response.model';

@Injectable({ providedIn: 'root' })
export class GamificationService extends BaseService {
  private apiUrl = this.url + '/gamification';

  getRank(): Observable<ResultEntity<UserRankResponse>> {
    return this.http.get<ResultEntity<UserRankResponse>>(`${this.apiUrl}/rank`);
  }

  getBadges(): Observable<ResultEntity<UserBadgeResponse[]>> {
    return this.http.get<ResultEntity<UserBadgeResponse[]>>(`${this.apiUrl}/badges`);
  }

  getActiveMissions(): Observable<ResultEntity<MissionProgressResponse[]>> {
    return this.http.get<ResultEntity<MissionProgressResponse[]>>(`${this.apiUrl}/missions/progress`);
  }
}
