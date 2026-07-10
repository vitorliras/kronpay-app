import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { Base } from '../../../core/bases/base/base';

@Component({
  selector: 'app-avatar-circular',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './avatar-circular.html',
  styleUrl: './avatar-circular.scss',
})
export class AvatarCircular extends Base implements OnDestroy {
  @Input() size = 44;
  @Input() rankTier?: string | null;

  private objectUrl: string | null = null;

  photoUrl$: Observable<string | null> = this.userService.user$.pipe(
    switchMap((user) => {
      if (!user.hasProfilePhoto) {
        this.revokeObjectUrl();
        return of(null);
      }

      return this.userService.getPhotoBlob().pipe(
        map((blob) => {
          this.revokeObjectUrl();
          this.objectUrl = URL.createObjectURL(blob);
          return this.objectUrl;
        }),
        catchError(() => of(null)),
      );
    }),
  );

  initials$: Observable<string> = this.userService.user$.pipe(
    map((user) => this.computeInitials(user.name)),
  );

  constructor() {
    super();
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  get rankTierClass(): string {
    return this.rankTier ? `rank-${this.rankTier.toLowerCase()}` : '';
  }

  get badgeSize(): number {
    return Math.max(14, Math.round(this.size / 2.6));
  }

  private computeInitials(name?: string): string {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';

    return (first + last).toUpperCase();
  }
}
