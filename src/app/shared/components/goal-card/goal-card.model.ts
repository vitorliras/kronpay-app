import { GoalPriority } from '../../../core/models/goals/goal-priority.model';

export interface GoalCardViewModel {
  id: number;
  type: 'financial' | 'category';
  title: string;
  subtitle: string;
  progressPercent: number;
  priority: GoalPriority;
  isAtRiskOrOverLimit: boolean;
}
