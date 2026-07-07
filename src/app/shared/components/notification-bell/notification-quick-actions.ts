import { Router } from '@angular/router';
import { NotificationResponse } from '../../../core/models/notifications/notification-response.model';
import { TransactionService } from '../../../core/services/transaction.service';

export interface NotificationQuickActionDeps {
  router: Router;
  transactionService: TransactionService;
  onSuccess: () => void;
  onError: (messageKey?: string) => void;
}

export interface NotificationQuickAction {
  labelKey: string;
  run: (notification: NotificationResponse, deps: NotificationQuickActionDeps) => void;
}

const viewInvoicesAction: NotificationQuickAction = {
  labelKey: 'ViewDetail',
  run: (_notification, deps) => {
    deps.router.navigate(['/credit-card/invoices']);
  },
};

const viewGoalsAction: NotificationQuickAction = {
  labelKey: 'ViewDetail',
  run: (_notification, deps) => {
    deps.router.navigate(['/goals']);
  },
};

const markTransactionAsPaidAction: NotificationQuickAction = {
  labelKey: 'MarkAsPaid',
  run: (notification, deps) => {
    if (notification.relatedEntityId == null) return;

    deps.transactionService
      .changeStatus({ id: notification.relatedEntityId, status: 'P' })
      .subscribe((result) => {
        if (result.isSuccess) {
          deps.onSuccess();
        } else {
          deps.onError(result.message);
        }
      });
  },
};

// Só os tipos com ação rápida definida no planejamento (SPEC 0026) — os demais (inteligência
// financeira, higiene de dados etc.) não têm ação, só marcam como lida ao clicar na linha.
const QUICK_ACTIONS_BY_TYPE: Record<string, NotificationQuickAction> = {
  TransactionOverdue: markTransactionAsPaidAction,
  TransactionDueToday: markTransactionAsPaidAction,
  TransactionDueTomorrow: markTransactionAsPaidAction,
  CardInvoiceOverdue: viewInvoicesAction,
  CardInvoiceDueReminder: viewInvoicesAction,
  CardInvoiceClosingReminder: viewInvoicesAction,
  FinancialGoalAtRisk: viewGoalsAction,
  FinancialGoalContributionOverdue: viewGoalsAction,
  FinancialGoalNearCompletionReminder: viewGoalsAction,
  FinancialGoalContributionReminder: viewGoalsAction,
  FinancialGoalCompleted: viewGoalsAction,
  CategoryBudgetGoalExceeded: viewGoalsAction,
  CategoryBudgetGoalNearLimit: viewGoalsAction,
};

export function getQuickAction(type: string): NotificationQuickAction | null {
  return QUICK_ACTIONS_BY_TYPE[type] ?? null;
}
