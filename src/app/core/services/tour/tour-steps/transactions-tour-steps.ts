import { TourStep } from '../../../models/tour/tour-step.model';

export const TRANSACTIONS_TOUR_STEPS: TourStep[] = [
  { anchorId: 'transactions-summary', titleKey: 'TourTransactionsSummaryTitle', descriptionKey: 'TourTransactionsSummaryDescription', placement: 'bottom' },
  { anchorId: 'transactions-add-button', titleKey: 'TourTransactionsAddTitle', descriptionKey: 'TourTransactionsAddDescription', placement: 'left' },
  { anchorId: 'transactions-table', titleKey: 'TourTransactionsTableTitle', descriptionKey: 'TourTransactionsTableDescription', placement: 'top' },
];
