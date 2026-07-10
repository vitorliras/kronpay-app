import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, interval, Subject, switchMap, takeUntil } from 'rxjs';
import { Base } from '../../../core/bases/base/base';
import { UserBadgeResponse } from '../../../core/models/gamification/user-badge-response.model';
import { GamificationService } from '../../../core/services/gamification/gamification.service';

const POLL_INTERVAL_MS = 15000;
const DISPLAY_DURATION_MS = 6000;

@Component({
  selector: 'app-achievement-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './achievement-toast.html',
  styleUrl: './achievement-toast.scss',
})
export class AchievementToastComponent extends Base implements OnInit, OnDestroy {
  private gamificationService = inject(GamificationService);
  private destroy$ = new Subject<void>();
  private dismissTimer?: ReturnType<typeof setTimeout>;

  private knownUnlockedCodes: Set<string> | null = null;
  private queue: UserBadgeResponse[] = [];

  private currentSubject = new BehaviorSubject<UserBadgeResponse | null>(null);
  current$ = this.currentSubject.asObservable();

  private leavingSubject = new BehaviorSubject<boolean>(false);
  leaving$ = this.leavingSubject.asObservable();

  constructor() {
    super();
  }

  ngOnInit(): void {
    interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => this.gamificationService.getBadges()),
        takeUntil(this.destroy$),
      )
      .subscribe((result) => {
        if (!result.isSuccess || !result.value) return;
        this.processBadges(result.value);
      });

    this.gamificationService.getBadges().subscribe((result) => {
      if (!result.isSuccess || !result.value) return;
      this.knownUnlockedCodes = new Set(
        result.value.filter((b) => b.isUnlocked).map((b) => b.code),
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
  }

  badgeTierClass(badge: UserBadgeResponse | null): string {
    return badge ? `rank-${badge.tier.toLowerCase()}` : '';
  }

  dismissCurrent(): void {
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.leavingSubject.next(true);
    setTimeout(() => {
      this.currentSubject.next(null);
      this.leavingSubject.next(false);
      this.showNextFromQueue();
    }, 320);
  }

  private processBadges(badges: UserBadgeResponse[]): void {
    if (this.knownUnlockedCodes === null) {
      this.knownUnlockedCodes = new Set(badges.filter((b) => b.isUnlocked).map((b) => b.code));
      return;
    }

    const newlyUnlocked = badges.filter(
      (b) => b.isUnlocked && !this.knownUnlockedCodes!.has(b.code),
    );

    for (const badge of newlyUnlocked) {
      this.knownUnlockedCodes.add(badge.code);
      this.queue.push(badge);
    }

    if (newlyUnlocked.length > 0) this.showNextFromQueue();
  }

  private showNextFromQueue(): void {
    if (this.currentSubject.value || this.queue.length === 0) return;

    this.currentSubject.next(this.queue.shift()!);
    this.leavingSubject.next(false);

    this.dismissTimer = setTimeout(() => this.dismissCurrent(), DISPLAY_DURATION_MS);
  }
}
