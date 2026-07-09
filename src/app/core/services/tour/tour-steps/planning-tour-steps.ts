import { TourStep } from '../../../models/tour/tour-step.model';

export const PLANNING_TOUR_STEPS: TourStep[] = [
  { anchorId: 'planning-tabs', titleKey: 'TourPlanningTabsTitle', descriptionKey: 'TourPlanningTabsDescription', placement: 'bottom' },
  { anchorId: 'planning-controls', titleKey: 'TourPlanningControlsTitle', descriptionKey: 'TourPlanningControlsDescription', placement: 'bottom' },
  { anchorId: 'planning-kpis', titleKey: 'TourPlanningKpisTitle', descriptionKey: 'TourPlanningKpisDescription', placement: 'top' },
];
