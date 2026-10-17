import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, firstValueFrom } from 'rxjs';
import type { GoalFormResult } from '../../pages/goals/goal-form-modal/goal-form-modal';
import { AiChatAction, AiChatActionType } from '../models/ai-chat/ai-chat-action.model';
import { CategoryResponse } from '../models/config/category/category-response.model';
import { GoalPriority } from '../models/goals/goal-priority.model';
import { ResultEntity } from '../models/result-entity.model';
import { CategoryItemService } from './category-item.service';
import { CategoryService } from './category.service';
import { GoalService } from './goal.service';
import { PaymentMethodService } from './payment-method.service';
import { PlanningService } from './planning.service';

const MODAL_ACTIONS: AiChatActionType[] = [
  'open_transactions_modal',
  'open_card_purchases_modal',
  'open_category_modal',
  'open_subcategory_modal',
  'open_payment_method_modal',
  'open_goal_modal',
  'open_category_goal_modal',
  'open_goal_contribution_modal',
  'open_planned_commitment_modal',
];

const FALLBACK_ROUTE = '/dashboard';

@Injectable({ providedIn: 'root' })
export class AiActionModalService {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private categoryService = inject(CategoryService);
  private categoryItemService = inject(CategoryItemService);
  private paymentMethodService = inject(PaymentMethodService);
  private goalService = inject(GoalService);
  private planningService = inject(PlanningService);

  isModalAction(action: AiChatAction): boolean {
    return MODAL_ACTIONS.includes(action.type);
  }

  async run(action: AiChatAction): Promise<boolean> {
    const saved = await this.open(action);

    if (saved && action.path) await this.navigateTo(action.path, action.queryParams);

    return saved;
  }

  private open(action: AiChatAction): Promise<boolean> {
    switch (action.type) {
      case 'open_transactions_modal':
        return this.openTransactions(action);
      case 'open_card_purchases_modal':
        return this.openCardPurchases(action);
      case 'open_category_modal':
        return this.openCategory(action);
      case 'open_subcategory_modal':
        return this.openSubcategory(action);
      case 'open_payment_method_modal':
        return this.openPaymentMethod(action);
      case 'open_goal_modal':
      case 'open_category_goal_modal':
        return this.openGoal(action);
      case 'open_goal_contribution_modal':
        return this.openGoalContribution(action);
      case 'open_planned_commitment_modal':
        return this.openPlannedCommitment(action);
      default:
        return Promise.resolve(false);
    }
  }

  private async openTransactions(action: AiChatAction): Promise<boolean> {
    if (!action.transactionDrafts) return false;

    const { TransactionPreviewModal } = await import(
      '../../pages/transaction/transaction-preview-modal/transaction-preview-modal'
    );

    const [categories, paymentMethods] = await Promise.all([
      this.loadCategories(),
      this.loadPaymentMethods(),
    ]);

    const dialogRef = this.dialog.open(TransactionPreviewModal, {
      autoFocus: false,
      data: { drafts: action.transactionDrafts, categories, paymentMethods },
    });

    return (await firstValueFrom(dialogRef.afterClosed())) === true;
  }

  private async openCardPurchases(action: AiChatAction): Promise<boolean> {
    if (!action.cardPurchasesPreview || !action.creditCardId) return false;

    const { CardPurchasePreviewModal } = await import(
      '../../pages/credit-card/card-purchase-preview-modal/card-purchase-preview-modal'
    );

    const categories = (await this.loadCategories()).filter((c) => c.codTypeTransaction === 'E');

    const dialogRef = this.dialog.open(CardPurchasePreviewModal, {
      autoFocus: false,
      data: {
        creditCardId: action.creditCardId,
        preview: action.cardPurchasesPreview,
        categories,
      },
    });

    return (await firstValueFrom(dialogRef.afterClosed())) === true;
  }

  private async openCategory(action: AiChatAction): Promise<boolean> {
    if (!action.categoryDraft) return false;

    const { ConfigCategoryModal } = await import(
      '../../pages/config/config-category-modal/config-category-modal'
    );

    const dialogRef = this.dialog.open(ConfigCategoryModal, {
      data: { prefill: action.categoryDraft },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return false;

    return this.persist(
      this.categoryService.create({
        description: result.description,
        codTypeTransaction: result.codTypeTransaction,
        isCardInvoiceCategory: result.isCardInvoiceCategory,
      }),
    );
  }

  private async openSubcategory(action: AiChatAction): Promise<boolean> {
    if (!action.subcategoryDraft) return false;

    const { ConfigCategoryItemModal } = await import(
      '../../pages/config/config-category-item-modal/config-category-item-modal'
    );

    const categories = await this.loadCategories();

    const dialogRef = this.dialog.open(ConfigCategoryItemModal, {
      data: { categories, prefill: action.subcategoryDraft },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return false;

    return this.persist(
      this.categoryItemService.create({
        description: result.description,
        categoryId: result.categoryId,
      }),
    );
  }

  private async openPaymentMethod(action: AiChatAction): Promise<boolean> {
    if (!action.paymentMethodDraft) return false;

    const { ConfigPaymentMethodModal } = await import(
      '../../pages/config/config-payment-method-modal/config-payment-method-modal'
    );

    const dialogRef = this.dialog.open(ConfigPaymentMethodModal, {
      data: { prefill: action.paymentMethodDraft },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return false;

    return this.persist(this.paymentMethodService.create({ description: result.description }));
  }

  private async openGoal(action: AiChatAction): Promise<boolean> {
    const { GoalFormModal } = await import('../../pages/goals/goal-form-modal/goal-form-modal');

    const categories = await this.loadCategories();

    const dialogRef = this.dialog.open(GoalFormModal, {
      data: {
        categories,
        financialPrefill: action.financialGoalDraft ?? undefined,
        categoryPrefill: action.categoryBudgetGoalDraft ?? undefined,
      },
    });

    const result: GoalFormResult | undefined = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return false;

    if (result.type === 'financial') {
      return this.persist(
        this.goalService.createFinancialGoal({
          description: result.value.description,
          targetAmount: result.value.targetAmount,
          targetDate: result.value.targetDate,
          priority: result.value.priority as GoalPriority,
        }),
      );
    }

    return this.persist(
      this.goalService.createCategoryBudgetGoal({
        categoryId: result.value.categoryId,
        monthlyLimit: result.value.monthlyLimit,
        priority: result.value.priority as GoalPriority,
      }),
    );
  }

  private async openGoalContribution(action: AiChatAction): Promise<boolean> {
    const draft = action.goalContributionDraft;
    if (!draft) return false;

    const overview = await firstValueFrom(this.goalService.getOverview());
    const goal = overview.value?.financialGoals.find((g) => g.id === draft.goalId);
    if (!goal) return false;

    const { GoalContributionModal } = await import(
      '../../pages/goals/goal-contribution-modal/goal-contribution-modal'
    );

    const dialogRef = this.dialog.open(GoalContributionModal, {
      data: { goal, prefillAmount: draft.amount },
    });

    const amount: number | undefined = await firstValueFrom(dialogRef.afterClosed());
    if (!amount) return false;

    return this.persist(this.goalService.registerContribution({ goalId: draft.goalId, amount }));
  }

  private async openPlannedCommitment(action: AiChatAction): Promise<boolean> {
    if (!action.plannedCommitmentDraft) return false;

    const { PlanningCommitmentModal } = await import(
      '../../pages/planning/planning-commitment-modal/planning-commitment-modal'
    );

    const categories = await this.loadCategories();

    const dialogRef = this.dialog.open(PlanningCommitmentModal, {
      data: { categories, prefill: action.plannedCommitmentDraft },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return false;

    return this.persist(
      this.planningService.createCommitment({
        description: result.description,
        amount: result.amount,
        direction: result.direction,
        periodicity: result.periodicity,
        startDate: result.startDate,
        endDate: result.endDate || null,
        categoryId: result.categoryId ?? null,
      }),
    );
  }

  private async persist(request$: Observable<ResultEntity<unknown>>): Promise<boolean> {
    try {
      const res = await firstValueFrom(request$);

      if (res.isSuccess) {
        this.toastr.success(res.message);
        return true;
      }

      this.toastr.warning(res.message);
      return false;
    } catch {
      return false;
    }
  }

  private async loadCategories(): Promise<CategoryResponse[]> {
    const res = await firstValueFrom(this.categoryService.getAll());
    return res.isSuccess ? (res.value ?? []) : [];
  }

  private async loadPaymentMethods() {
    const res = await firstValueFrom(this.paymentMethodService.getAll());
    return res.isSuccess ? (res.value ?? []) : [];
  }

  async navigateTo(path: string, queryParams: Record<string, string> | null): Promise<void> {
    const currentPath = this.router.url.split('?')[0];

    if (currentPath === path) {
      await this.router.navigateByUrl(FALLBACK_ROUTE, { skipLocationChange: true });
    }

    await this.router.navigate([path], { queryParams: queryParams ?? undefined });
  }
}
