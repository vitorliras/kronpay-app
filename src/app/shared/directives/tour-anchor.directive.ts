import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { TourService } from '../../core/services/tour/tour.service';

@Directive({
  selector: '[appTourAnchor]',
  standalone: true,
})
export class TourAnchorDirective implements OnInit, OnDestroy {
  @Input('appTourAnchor') anchorId = '';

  private elementRef = inject(ElementRef);
  private tourService = inject(TourService);

  ngOnInit(): void {
    if (this.anchorId) this.tourService.registerAnchor(this.anchorId, this.elementRef);
  }

  ngOnDestroy(): void {
    if (this.anchorId) this.tourService.unregisterAnchor(this.anchorId);
  }
}
