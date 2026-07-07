import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Base } from '../../../core/bases/base/base';
import { NotificationResponse } from '../../../core/models/notifications/notification-response.model';
import { NotificationService } from '../../../core/services/notification.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { getQuickAction } from '../notification-bell/notification-quick-actions';
import { interpolateNotificationText } from '../notification-bell/notification-text';
import { getCriticalityLabelKey, getNotificationIcon } from '../notification-bell/notification-icons';

@Component({
  selector: 'app-notification-critical-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './notification-critical-modal.html',
  styleUrl: './notification-critical-modal.scss',
})
export class NotificationCriticalModalComponent extends Base {
  private notificationService = inject(NotificationService);
  private transactionService = inject(TransactionService);

  // Observable (não campo mutado dentro de subscribe) — app roda sem Zone.js, mesmo padrão
  // já usado em NotificationBellComponent.
  private notificationsSubject: BehaviorSubject<NotificationResponse[]>;
  notifications$;

  constructor(
    private dialogRef: MatDialogRef<NotificationCriticalModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: { notifications: NotificationResponse[] },
  ) {
    super();

    this.notificationsSubject = new BehaviorSubject<NotificationResponse[]>(data.notifications);
    this.notifications$ = this.notificationsSubject.asObservable();

    // "Lida" (destaque no sino) não é o mesmo que "resolvida" — continuam ativas até a
    // condição de origem ser resolvida, só perdem o destaque de não lida.
    data.notifications
      .filter((notification) => !notification.isRead)
      .forEach((notification) => {
        this.notificationService.markAsRead(notification.id).subscribe((result) => {
          if (!result.isSuccess) return;

          const updated = this.notificationsSubject.value.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          );
          this.notificationsSubject.next(updated);
        });
      });
  }

  notificationText(notification: NotificationResponse, t: Record<string, string>): string {
    const template = t[notification.messageKey] ?? notification.messageKey;
    return interpolateNotificationText(template, notification.args);
  }

  notificationIcon(notification: NotificationResponse): string {
    return getNotificationIcon(notification.type);
  }

  criticalityLabelKey(notification: NotificationResponse): string {
    return getCriticalityLabelKey(notification.criticality);
  }

  hasQuickAction(notification: NotificationResponse): boolean {
    return getQuickAction(notification.type) !== null;
  }

  quickActionLabelKey(notification: NotificationResponse): string {
    return getQuickAction(notification.type)?.labelKey ?? '';
  }

  runQuickAction(notification: NotificationResponse): void {
    const action = getQuickAction(notification.type);
    if (!action) return;

    action.run(notification, {
      router: this.router,
      transactionService: this.transactionService,
      onSuccess: () => this.messageSucess('OperationSuccess'),
      onError: (messageKey) => this.messageError(messageKey ?? 'OperationFailed'),
    });

    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
