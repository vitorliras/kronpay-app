import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Base } from '../../core/bases/base/base';
import { GoalService } from '../../core/services/goal.service';
import { CategoryService } from '../../core/services/category.service';
import { CategoryResponse } from '../../core/models/config/category/category-response.model';
import { FinancialGoalResponse } from '../../core/models/goals/financial-goal-response.model';
import { CategoryBudgetGoalResponse } from '../../core/models/goals/category-budget-goal-response.model';
import { GoalPriority } from '../../core/models/goals/goal-priority.model';
import { GoalCard } from '../../shared/components/goal-card/goal-card';
import { GoalCardViewModel } from '../../shared/components/goal-card/goal-card.model';
import { GoalFormModal, GoalFormResult } from './goal-form-modal/goal-form-modal';
import { GoalDetailModal } from './goal-detail-modal/goal-detail-modal';
import { GoalContributionModal } from './goal-contribution-modal/goal-contribution-modal';

type GoalListItem = GoalCardViewModel & {
  raw: FinancialGoalResponse | CategoryBudgetGoalResponse;
};

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, GoalCard],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class Goals extends Base implements OnInit {
  private goalService = inject(GoalService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  categories: CategoryResponse[] = [];
  financialGoals: FinancialGoalResponse[] = [];
  categoryBudgetGoals: CategoryBudgetGoalResponse[] = [];
  items: GoalListItem[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadCategories();
    this.loadOverview();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess) this.categories = res.value ?? [];
      this.rebuildItems();
    });
  }

  loadOverview(): void {
    this.isLoading = true;
    this.goalService.getOverview().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.financialGoals = res.isSuccess ? (res.value?.financialGoals ?? []) : [];
        this.categoryBudgetGoals = res.isSuccess ? (res.value?.categoryBudgetGoals ?? []) : [];
        this.rebuildItems();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private rebuildItems(): void {
    const financial = this.financialGoals.map((g) => this.toFinancialItem(g));
    const category = this.categoryBudgetGoals.map((g) => this.toCategoryItem(g));
    this.items = [...financial, ...category];
  }

  trackByItem(_index: number, item: GoalListItem): string {
    return `${item.type}:${item.id}`;
  }

  categoryName(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.description ?? '';
  }

  private toFinancialItem(goal: FinancialGoalResponse): GoalListItem {
    const progressPercent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

    return {
      id: goal.id,
      type: 'financial',
      title: goal.description,
      subtitle: `R$ ${goal.currentAmount.toFixed(2)} / R$ ${goal.targetAmount.toFixed(2)}`,
      progressPercent,
      priority: goal.priority,
      isAtRiskOrOverLimit: this.isFinancialGoalAtRisk(goal),
      raw: goal,
    };
  }

  private toCategoryItem(goal: CategoryBudgetGoalResponse): GoalListItem {
    const progressPercent = goal.monthlyLimit > 0 ? (goal.currentPeriodSpent / goal.monthlyLimit) * 100 : 0;

    return {
      id: goal.id,
      type: 'category',
      title: this.categoryName(goal.categoryId),
      subtitle: `R$ ${goal.currentPeriodSpent.toFixed(2)} / R$ ${goal.monthlyLimit.toFixed(2)}`,
      progressPercent,
      priority: goal.priority,
      isAtRiskOrOverLimit: goal.currentPeriodSpent > goal.monthlyLimit,
      raw: goal,
    };
  }

  private isFinancialGoalAtRisk(goal: FinancialGoalResponse): boolean {
    const created = new Date(goal.createdAt).getTime();
    const target = new Date(goal.targetDate).getTime();
    const now = Date.now();

    if (target <= created) return false;

    const expectedProgress = Math.min(1, Math.max(0, (now - created) / (target - created)));
    const actualProgress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 1;

    return actualProgress < expectedProgress * 0.8;
  }

  openNewGoalModal(): void {
    const dialogRef = this.dialog.open(GoalFormModal, {
      data: { categories: this.categories },
    });

    dialogRef.afterClosed().subscribe((result: GoalFormResult) => this.handleFormResult(result));
  }

  openEditModal(item: GoalListItem): void {
    const data =
      item.type === 'financial'
        ? { financialGoal: item.raw as FinancialGoalResponse, categories: this.categories }
        : { categoryGoal: item.raw as CategoryBudgetGoalResponse, categories: this.categories };

    const dialogRef = this.dialog.open(GoalFormModal, { data });

    dialogRef.afterClosed().subscribe((result: GoalFormResult) => this.handleFormResult(result));
  }

  private handleFormResult(result: GoalFormResult): void {
    if (!result) return;

    if (result.type === 'financial') {
      const payload = {
        description: result.value.description,
        targetAmount: result.value.targetAmount,
        targetDate: result.value.targetDate,
        priority: result.value.priority as GoalPriority,
      };

      const request$ = result.value.id
        ? this.goalService.updateFinancialGoal({ id: result.value.id, ...payload })
        : this.goalService.createFinancialGoal(payload);

      request$.subscribe((res) => this.handleMutationResult(res));
      return;
    }

    const categoryPayload = {
      categoryId: result.value.categoryId,
      monthlyLimit: result.value.monthlyLimit,
      priority: result.value.priority as GoalPriority,
    };

    const request$ = result.value.id
      ? this.goalService.updateCategoryBudgetGoal({ id: result.value.id, ...categoryPayload })
      : this.goalService.createCategoryBudgetGoal(categoryPayload);

    request$.subscribe((res) => this.handleMutationResult(res));
  }

  private handleMutationResult(res: { isSuccess: boolean; message?: string }): void {
    if (res.isSuccess) {
      this.toastr.success(res.message);
      this.loadOverview();
    } else {
      this.toastr.warning(res.message);
    }
  }

  cancelGoal(item: GoalListItem): void {
    this.confirmModal('Cancel', 'ConfirmCancelGoal', 'Confirm', 'Cancel').subscribe((ok: boolean) => {
      if (!ok) return;

      const request$ =
        item.type === 'financial'
          ? this.goalService.cancelFinancialGoal({ id: item.id })
          : this.goalService.deactivateCategoryBudgetGoal({ id: item.id });

      request$.subscribe((res) => this.handleMutationResult(res));
    });
  }

  addContribution(item: GoalListItem): void {
    const dialogRef = this.dialog.open(GoalContributionModal, {
      data: { goal: item.raw as FinancialGoalResponse },
    });

    dialogRef.afterClosed().subscribe((amount: number | undefined) => {
      if (!amount) return;

      this.goalService.registerContribution({ goalId: item.id, amount }).subscribe((res) => {
        this.handleMutationResult(res);
      });
    });
  }

  openDetailModal(item: GoalListItem): void {
    const data =
      item.type === 'financial'
        ? { type: 'financial' as const, financialGoal: item.raw as FinancialGoalResponse }
        : {
            type: 'category' as const,
            categoryGoal: item.raw as CategoryBudgetGoalResponse,
            categoryName: this.categoryName((item.raw as CategoryBudgetGoalResponse).categoryId),
            activeFinancialGoals: this.financialGoals,
          };

    this.dialog.open(GoalDetailModal, { data });
  }
}
