import { Component, inject, Input } from '@angular/core';
import { Base } from '../../../../core/bases/base/base';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../../core/services/user.service';
import { AvatarCircular } from '../../avatar-circular/avatar-circular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, RouterModule, AvatarCircular],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar extends Base {
  isCollapsed = false;
  user$ = this.userService.getUser();

  creditCardOpen = false;

  constructor() {
    super();
    // Abre o submenu automaticamente quando já se está numa rota de cartão.
    this.creditCardOpen = this.router.url.startsWith('/credit-card');
  }

  get isCreditCardActive(): boolean {
    return this.router.url.startsWith('/credit-card');
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleCreditCard() {
    this.creditCardOpen = !this.creditCardOpen;
  }
}
