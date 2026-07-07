import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Base } from '../../../../core/bases/base/base';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvatarCircular } from '../../avatar-circular/avatar-circular';
import { NotificationBellComponent } from '../../notification-bell/notification-bell';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatIconModule, MatTooltipModule, AvatarCircular, NotificationBellComponent],
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.scss', '../../../../../styles/main.scss'],
})
export class Header extends Base {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  user$ = this.userService.getUser();

  constructor() {
    super();
  }

  logout() {
    this.confirmModal('Atention', 'EndSession', 'Yes', 'No', '380', 'help_outline').subscribe(
      (result) => {
        if (!result) return;
        this.authService.logout().subscribe(() => {
          this.messageSucess('LogoutSuccess');
          this.router.navigate(['/auth/login']);
        });
      },
    );
  }
}
