import { Component, inject, Input } from '@angular/core';
import { Base } from '../../../../core/bases/base/base';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../../core/services/user.service';
import { AvatarCircular } from '../../avatar-circular/avatar-circular';
import { GamificationService } from '../../../../core/services/gamification/gamification.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, RouterModule, AvatarCircular],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar extends Base {
  private gamificationService = inject(GamificationService);

  isCollapsed = false;
  user$ = this.userService.getUser();

  rankTier$: Observable<string | null> = this.gamificationService.getRank().pipe(
    map((res) => (res.isSuccess && res.value ? res.value.tier : null)),
    catchError(() => of(null)),
  );

  creditCardOpen = false;
  profileOpen = false;

  constructor() {
    super();
    this.creditCardOpen = this.router.url.startsWith('/credit-card');
    this.profileOpen = this.router.url.startsWith('/profile');
  }

  get isCreditCardActive(): boolean {
    return this.router.url.startsWith('/credit-card');
  }

  get isProfileActive(): boolean {
    return this.router.url.startsWith('/profile');
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleCreditCard() {
    this.creditCardOpen = !this.creditCardOpen;
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }
}
