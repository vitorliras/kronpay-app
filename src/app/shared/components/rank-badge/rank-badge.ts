import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rank-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './rank-badge.html',
  styleUrl: './rank-badge.scss',
})
export class RankBadge {
  @Input() tier?: string | null;
  @Input() size = 96;

  get rankTierClass(): string {
    return this.tier ? `rank-${this.tier.toLowerCase()}` : '';
  }

  get iconSize(): number {
    return Math.round(this.size * 0.5);
  }
}
