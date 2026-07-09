import { Component, OnDestroy, TemplateRef, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ConnectedPosition, Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { Base } from '../../../core/bases/base/base';
import { TourService } from '../../../core/services/tour/tour.service';
import { TourStep } from '../../../core/models/tour/tour-step.model';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
const ANCHOR_RETRY_ATTEMPTS = 10;
const ANCHOR_RETRY_DELAY_MS = 80;

@Component({
  selector: 'app-tour-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, OverlayModule],
  templateUrl: './tour-overlay.html',
  styleUrl: './tour-overlay.scss',
})
export class TourOverlayComponent extends Base implements OnDestroy {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private tourService = inject(TourService);
  private location = inject(Location);

  @ViewChild('stepTemplate') private stepTemplate!: TemplateRef<unknown>;

  private overlayRef: OverlayRef | null = null;
  private repositionListener = () => this.updateSpotlight();

  private spotlightSubject = new BehaviorSubject<SpotlightRect | null>(null);
  spotlight$ = this.spotlightSubject.asObservable();

  currentStep$ = this.tourService.currentStep$;
  stepProgress$ = this.tourService.stepProgress$;
  isFirstStep$ = this.tourService.isFirstStep$;
  isLastStep$ = this.tourService.isLastStep$;

  private currentStep: TourStep | null = null;
  private subscription: Subscription;
  private wasActive = false;

  constructor() {
    super();

    this.subscription = combineLatest([this.tourService.active$, this.currentStep$]).subscribe(
      ([active, step]) => {
        this.currentStep = step;

        if (active && step) {
          this.showStep(step);
        } else {
          this.teardown();
        }

        if (this.wasActive && !active) {
          this.clearTourQueryParam();
        }
        this.wasActive = active;
      },
    );

    window.addEventListener('resize', this.repositionListener);
    window.addEventListener('scroll', this.repositionListener, true);
  }

  next(): void {
    this.tourService.next();
  }

  previous(): void {
    this.tourService.previous();
  }

  skip(): void {
    this.tourService.skip();
  }

  private showStep(step: TourStep, attempt = 0): void {
    this.teardown();

    const anchor = this.tourService.getAnchorElement(step.anchorId);
    if (!anchor) {
      if (attempt < ANCHOR_RETRY_ATTEMPTS && this.currentStep === step) {
        setTimeout(() => this.showStep(step, attempt + 1), ANCHOR_RETRY_DELAY_MS);
      }
      return;
    }

    anchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions(this.positionsFor(step.placement))
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
    });

    this.overlayRef.attach(new TemplatePortal(this.stepTemplate, this.viewContainerRef));
    this.updateSpotlight();
  }

  private updateSpotlight(): void {
    if (!this.currentStep) {
      this.spotlightSubject.next(null);
      return;
    }

    const anchor = this.tourService.getAnchorElement(this.currentStep.anchorId);
    if (!anchor) {
      this.spotlightSubject.next(null);
      return;
    }

    const rect = anchor.nativeElement.getBoundingClientRect();
    this.spotlightSubject.next({
      top: rect.top - SPOTLIGHT_PADDING,
      left: rect.left - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    });

    this.overlayRef?.updatePosition();
  }

  private teardown(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.spotlightSubject.next(null);
  }

  private clearTourQueryParam(): void {
    const [path, query] = this.location.path().split('?');
    if (!query) return;

    const params = new URLSearchParams(query);
    if (!params.has('tour')) return;

    params.delete('tour');
    const newQuery = params.toString();
    this.location.replaceState(newQuery ? `${path}?${newQuery}` : path);
  }

  private positionsFor(placement: TourStep['placement']): ConnectedPosition[] {
    switch (placement) {
      case 'top':
        return [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -12 }];
      case 'left':
        return [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -12 }];
      case 'right':
        return [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 12 }];
      case 'bottom':
      default:
        return [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 }];
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.teardown();
    window.removeEventListener('resize', this.repositionListener);
    window.removeEventListener('scroll', this.repositionListener, true);
  }
}
