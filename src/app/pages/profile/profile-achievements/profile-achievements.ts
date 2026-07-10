import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Base } from '../../../core/bases/base/base';
import { GamificationService } from '../../../core/services/gamification/gamification.service';
import { UserRankResponse } from '../../../core/models/gamification/user-rank-response.model';
import { UserBadgeResponse } from '../../../core/models/gamification/user-badge-response.model';
import { RankBadge } from '../../../shared/components/rank-badge/rank-badge';

@Component({
  selector: 'app-profile-achievements',
  standalone: true,
  imports: [CommonModule, MatIconModule, RankBadge],
  templateUrl: './profile-achievements.html',
  styleUrls: ['./profile-achievements.scss', '../../../../styles/main.scss'],
})
export class ProfileAchievements extends Base implements OnInit {
  private gamificationService = inject(GamificationService);
  private cdr = inject(ChangeDetectorRef);

  readonly tiers = ['Bronze', 'Prata', 'Ouro'];

  rank: UserRankResponse | null = null;
  badges: UserBadgeResponse[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadRank();
    this.loadBadges();
  }

  loadRank(): void {
    this.gamificationService.getRank().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.rank = res.value;
      }
      this.cdr.detectChanges();
    });
  }

  loadBadges(): void {
    this.gamificationService.getBadges().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.badges = res.value;
      }
      this.cdr.detectChanges();
    });
  }

  badgesByTier(tier: string): UserBadgeResponse[] {
    return this.badges.filter((b) => b.tier === tier);
  }

  unlockedCount(tier: string): number {
    return this.badgesByTier(tier).filter((b) => b.isUnlocked).length;
  }

  formatUnlockedAt(unlockedAt: string | null | undefined): string {
    if (!unlockedAt) return '';

    const date = new Date(unlockedAt);
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }
}
