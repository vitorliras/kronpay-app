import { Component, inject, OnInit } from '@angular/core';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationCriticalModalComponent } from '../notification-critical-modal/notification-critical-modal';
import { AssistantWidgetComponent } from '../assistant-widget/assistant-widget';
import { TourOverlayComponent } from '../tour-overlay/tour-overlay';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, Sidebar, Header, RouterOutlet, AssistantWidgetComponent, TourOverlayComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  collapsed = false;

  toggleMenu() {
    this.collapsed = !this.collapsed;
  }

  ngOnInit(): void {
    if (this.notificationService.hasCriticalModalBeenShown()) return;

    this.notificationService.markCriticalModalShown();

    this.notificationService.getCritical().subscribe((result) => {
      if (result.isSuccess && result.value && result.value.length > 0) {
        this.dialog.open(NotificationCriticalModalComponent, {
          data: { notifications: result.value },
          panelClass: 'critical-modal-panel',
        });
      }
    });
  }
}
