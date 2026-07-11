const ICON_BY_TYPE_PREFIX: ReadonlyArray<[string, string]> = [
  ['Transaction', 'receipt_long'],
  ['CardInvoice', 'credit_card'],
  ['CategoryBudgetGoal', 'pie_chart'],
  ['CategoryWithoutBudgetGoal', 'pie_chart'],
  ['CategorySpending', 'insights'],
  ['FinancialGoal', 'flag'],
  ['ProjectedNegativeBalance', 'trending_down'],
  ['ProjectedSpendingPace', 'speed'],
  ['RecurringExpenseIncreased', 'repeat'],
  ['MonthlySavingsSummary', 'savings'],
  ['SignificantSpendingIncrease', 'trending_up'],
  ['NetWorthChange', 'account_balance'],
  ['NoTransactionLoggedRecently', 'edit_note'],
];

const DEFAULT_ICON = 'notifications';

export function getNotificationIcon(type: string): string {
  const match = ICON_BY_TYPE_PREFIX.find(([prefix]) => type.startsWith(prefix));
  return match?.[1] ?? DEFAULT_ICON;
}

const LABEL_KEY_BY_CRITICALITY: Record<string, string> = {
  Critical: 'NotificationLevelCritical',
  Important: 'NotificationLevelImportant',
  Informative: 'NotificationLevelInformative',
};

export function getCriticalityLabelKey(criticality: string): string {
  return LABEL_KEY_BY_CRITICALITY[criticality] ?? 'NotificationLevelInformative';
}
