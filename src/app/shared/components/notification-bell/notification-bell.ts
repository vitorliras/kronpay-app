import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Base } from '../../../core/bases/base/base';
import { NotificationResponse } from '../../../core/models/notifications/notification-response.model';
import { NotificationService } from '../../../core/services/notification.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { getQuickAction } from './notification-quick-actions';
import { interpolateNotificationText } from './notification-text';
import { getNotificationIcon } from './notification-icons';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
})
export class NotificationBellComponent extends Base implements OnInit {
  private notificationService = inject(NotificationService);
  private transactionService = inject(TransactionService);

  unreadCount$ = this.notificationService.unreadCount$;

  private activeSubject = new BehaviorSubject<NotificationResponse[]>([]);
  active$ = this.activeSubject.asObservable();

  private archivedSubject = new BehaviorSubject<NotificationResponse[]>([]);
  archived$ = this.archivedSubject.asObservable();

  private loadingActiveSubject = new BehaviorSubject<boolean>(false);
  loadingActive$ = this.loadingActiveSubject.asObservable();

  private loadingArchivedSubject = new BehaviorSubject<boolean>(false);
  loadingArchived$ = this.loadingArchivedSubject.asObservable();

  private archivedLoaded = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.notificationService.getUnreadCount().subscribe();
    this.loadActive();
  }

  onPanelOpened(): void {
    this.loadActive();
  }

  onTabChange(index: number): void {
    if (index === 1 && !this.archivedLoaded) {
      this.loadArchived();
    }
  }

  notificationText(notification: NotificationResponse, t: Record<string, string>): string {
    const template = t[notification.messageKey] ?? notification.messageKey;
    return interpolateNotificationText(template, notification.args);
  }

  notificationIcon(notification: NotificationResponse): string {
    return getNotificationIcon(notification.type);
  }

  unreadCountLabel(count: number, t: Record<string, string>): string {
    const template = t['NotificationsUnreadCountLabel'] ?? '{count}';
    return interpolateNotificationText(template, { count: String(count) });
  }

  hasQuickAction(notification: NotificationResponse): boolean {
    return getQuickAction(notification.type) !== null;
  }

  quickActionLabelKey(notification: NotificationResponse): string {
    return getQuickAction(notification.type)?.labelKey ?? '';
  }

  runQuickAction(notification: NotificationResponse, event: Event): void {
    event.stopPropagation();

    const action = getQuickAction(notification.type);
    if (!action) return;

    action.run(notification, {
      router: this.router,
      transactionService: this.transactionService,
      onSuccess: () => {
        this.messageSucess('OperationSuccess');
        this.markAsReadLocally(notification);
      },
      onError: (messageKey) => this.messageError(messageKey ?? 'OperationFailed'),
    });
  }

  onRowClick(notification: NotificationResponse): void {
    this.markAsReadLocally(notification);
  }

  private markAsReadLocally(notification: NotificationResponse): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id).subscribe((result) => {
      if (!result.isSuccess) return;

      const updated = this.activeSubject.value.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n,
      );
      this.activeSubject.next(updated);
    });
  }

  private loadActive(): void {
    this.loadingActiveSubject.next(true);
    this.notificationService.getActive().subscribe((result) => {
      this.loadingActiveSubject.next(false);
      if (result.isSuccess && result.value) {
        this.activeSubject.next(result.value);
      }
    });
  }

  private loadArchived(): void {
    this.loadingArchivedSubject.next(true);
    this.notificationService.getArchived().subscribe((result) => {
      this.loadingArchivedSubject.next(false);
      this.archivedLoaded = true;
      if (result.isSuccess && result.value) {
        this.archivedSubject.next(result.value);
      }
    });
  }
}
