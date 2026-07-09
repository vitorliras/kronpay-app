import { TourStep } from '../../../models/tour/tour-step.model';

export const CONFIG_TOUR_STEPS: TourStep[] = [
  { anchorId: 'config-type-filter', titleKey: 'TourConfigFilterTitle', descriptionKey: 'TourConfigFilterDescription', placement: 'bottom' },
  { anchorId: 'config-search', titleKey: 'TourConfigSearchTitle', descriptionKey: 'TourConfigSearchDescription', placement: 'bottom' },
  { anchorId: 'config-add-button', titleKey: 'TourConfigAddTitle', descriptionKey: 'TourConfigAddDescription', placement: 'left' },
];
