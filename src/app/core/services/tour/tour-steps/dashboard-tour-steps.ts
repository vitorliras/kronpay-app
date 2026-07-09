import { TourStep } from '../../../models/tour/tour-step.model';

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  { anchorId: 'dashboard-tabs', titleKey: 'TourDashboardTabsTitle', descriptionKey: 'TourDashboardTabsDescription', placement: 'bottom' },
  { anchorId: 'dashboard-month-filter', titleKey: 'TourDashboardFilterTitle', descriptionKey: 'TourDashboardFilterDescription', placement: 'bottom' },
  { anchorId: 'dashboard-charts', titleKey: 'TourDashboardChartsTitle', descriptionKey: 'TourDashboardChartsDescription', placement: 'top' },
];
