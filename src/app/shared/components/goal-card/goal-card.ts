import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Base } from '../../../core/bases/base/base';
import { GoalPriority } from '../../../core/models/goals/goal-priority.model';
import { GoalCardViewModel } from './goal-card.model';

@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './goal-card.html',
  styleUrl: './goal-card.scss',
})
export class GoalCard extends Base {
  @Input({ required: true }) goal!: GoalCardViewModel;
  @Output() viewDetail = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() addContribution = new EventEmitter<void>();

  readonly GoalPriority = GoalPriority;

  constructor() {
    super();
  }

  get priorityKey(): string {
    switch (this.goal.priority) {
      case GoalPriority.High:
        return 'PriorityHigh';
      case GoalPriority.Medium:
        return 'PriorityMedium';
      default:
        return 'PriorityLow';
    }
  }

  get statusKey(): string {
    if (this.goal.type === 'financial') {
      return this.goal.isAtRiskOrOverLimit ? 'GoalAtRisk' : 'GoalOnTrack';
    }

    return this.goal.isAtRiskOrOverLimit ? 'OverLimit' : 'WithinLimit';
  }

  get progressWidth(): number {
    return Math.min(this.goal.progressPercent, 100);
  }
}
