import { CardPurchasePreviewResponse } from '../card/card-purchase-preview-response.model';
import { CategoryBudgetGoalDraft } from './category-budget-goal-draft.model';
import { CategoryDraft } from './category-draft.model';
import { FinancialGoalDraft } from './financial-goal-draft.model';
import { GoalContributionDraft } from './goal-contribution-draft.model';
import { InvoicePaymentProposal } from './invoice-payment-proposal.model';
import { PaymentMethodDraft } from './payment-method-draft.model';
import { PlannedCommitmentDraft } from './planned-commitment-draft.model';
import { SubcategoryDraft } from './subcategory-draft.model';
import { TransactionDraft } from './transaction-draft.model';

export type AiChatActionType =
  | 'navigate'
  | 'start_tour'
  | 'confirm_invoice_payment'
  | 'open_transactions_modal'
  | 'open_card_purchases_modal'
  | 'open_category_modal'
  | 'open_subcategory_modal'
  | 'open_payment_method_modal'
  | 'open_goal_modal'
  | 'open_category_goal_modal'
  | 'open_goal_contribution_modal'
  | 'open_planned_commitment_modal';

export interface AiChatAction {
  type: AiChatActionType;
  labelKey: string | null;
  path: string | null;
  queryParams: Record<string, string> | null;
  creditCardId: number | null;
  invoicePayment: InvoicePaymentProposal | null;
  cardPurchasesPreview: CardPurchasePreviewResponse | null;
  transactionDrafts: TransactionDraft[] | null;
  categoryDraft: CategoryDraft | null;
  subcategoryDraft: SubcategoryDraft | null;
  paymentMethodDraft: PaymentMethodDraft | null;
  financialGoalDraft: FinancialGoalDraft | null;
  categoryBudgetGoalDraft: CategoryBudgetGoalDraft | null;
  goalContributionDraft: GoalContributionDraft | null;
  plannedCommitmentDraft: PlannedCommitmentDraft | null;
}
