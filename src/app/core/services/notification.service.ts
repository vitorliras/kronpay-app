import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ResultEntity } from '../models/result-entity.model';
import { NotificationResponse } from '../models/notifications/notification-response.model';
import { NotificationPreferenceResponse } from '../models/notifications/notification-preference-response.model';
import { UpdateNotificationPreferencesRequest } from '../models/notifications/update-notification-preferences-request.model';
import { BaseService } from '../bases/base/base-service';

const CRITICAL_MODAL_SHOWN_KEY = 'notifications-critical-shown';

@Injectable({ providedIn: 'root' })
export class NotificationService extends BaseService {
  private apiUrl = this.url + '/notifications';

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  // Controla o modal de críticas ao logar (LayoutComponent) — "uma vez por sessão de
  // login", não "uma vez por aba de navegador". A flag precisa ser resetada no logout
  // (ver AuthService.clearSession) para não ficar presa entre login/logout na mesma aba.
  hasCriticalModalBeenShown(): boolean {
    return !!sessionStorage.getItem(CRITICAL_MODAL_SHOWN_KEY);
  }

  markCriticalModalShown(): void {
    sessionStorage.setItem(CRITICAL_MODAL_SHOWN_KEY, 'true');
  }

  resetCriticalModalFlag(): void {
    sessionStorage.removeItem(CRITICAL_MODAL_SHOWN_KEY);
  }

  getActive(): Observable<ResultEntity<NotificationResponse[]>> {
    return this.http.get<ResultEntity<NotificationResponse[]>>(this.apiUrl);
  }

  getArchived(): Observable<ResultEntity<NotificationResponse[]>> {
    return this.http.get<ResultEntity<NotificationResponse[]>>(`${this.apiUrl}/Archived`);
  }

  getCritical(): Observable<ResultEntity<NotificationResponse[]>> {
    return this.http.get<ResultEntity<NotificationResponse[]>>(`${this.apiUrl}/Critical`);
  }

  getUnreadCount(): Observable<ResultEntity<number>> {
    return this.http.get<ResultEntity<number>>(`${this.apiUrl}/unread-count`).pipe(
      tap((result) => {
        if (result.isSuccess && result.value !== undefined) {
          this.unreadCountSubject.next(result.value);
        }
      }),
    );
  }

  markAsRead(id: number): Observable<ResultEntity<NotificationResponse>> {
    return this.http.patch<ResultEntity<NotificationResponse>>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap((result) => {
        if (result.isSuccess) {
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        }
      }),
    );
  }

  getPreferences(): Observable<ResultEntity<NotificationPreferenceResponse>> {
    return this.http.get<ResultEntity<NotificationPreferenceResponse>>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(
    request: UpdateNotificationPreferencesRequest,
  ): Observable<ResultEntity<NotificationPreferenceResponse>> {
    return this.http.put<ResultEntity<NotificationPreferenceResponse>>(`${this.apiUrl}/preferences`, request);
  }
}
