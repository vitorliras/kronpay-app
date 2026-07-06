import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Base } from '../../core/bases/base/base';
import { GoalService } from '../../core/services/goal.service';
import { FinancialGoalResponse } from '../../core/models/goals/financial-goal-response.model';
import { FinancialGoalStatus } from '../../core/models/goals/financial-goal-status.model';
import { GoalRetryModal } from './goal-retry-modal/goal-retry-modal';

@Component({
  selector: 'app-goals-history',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './goals-history.html',
  styleUrls: ['./goals-history.scss', '../../../styles/main.scss'],
})
export class GoalsHistory extends Base implements OnInit {
  private goalService = inject(GoalService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  private search$ = new Subject<string>();

  readonly FinancialGoalStatus = FinancialGoalStatus;

  goals: FinancialGoalResponse[] = [];
  isLoading = false;

  constructor() {
    super();

    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((search) => {
      this.loadHistory(search);
    });
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(search?: string): void {
    this.isLoading = true;
    this.goalService.getHistory(search).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.goals = res.isSuccess ? (res.value?.goals ?? []) : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search$.next(input.value.trim());
  }

  statusKey(goal: FinancialGoalResponse): string {
    return goal.status === FinancialGoalStatus.Completed ? 'Completed' : 'Expired';
  }

  isExpired(goal: FinancialGoalResponse): boolean {
    return goal.status === FinancialGoalStatus.Expired;
  }

  retry(goal: FinancialGoalResponse): void {
    const dialogRef = this.dialog.open(GoalRetryModal, { data: { goal } });

    dialogRef.afterClosed().subscribe((newTargetDate: string | undefined) => {
      if (!newTargetDate) return;

      this.goalService.retry({ goalId: goal.id, newTargetDate }).subscribe((res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.loadHistory();
        } else {
          this.toastr.warning(res.message);
        }
      });
    });
  }
}
