import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { TourStep } from '../../models/tour/tour-step.model';

@Injectable({ providedIn: 'root' })
export class TourService {
  private anchors = new Map<string, ElementRef>();

  private stepsSubject = new BehaviorSubject<TourStep[]>([]);
  steps$ = this.stepsSubject.asObservable();

  private indexSubject = new BehaviorSubject<number>(0);
  index$ = this.indexSubject.asObservable();

  private activeSubject = new BehaviorSubject<boolean>(false);
  active$ = this.activeSubject.asObservable();

  currentStep$ = combineLatest([this.steps$, this.index$]).pipe(
    map(([steps, index]) => steps[index] ?? null),
  );

  stepProgress$ = combineLatest([this.steps$, this.index$]).pipe(
    map(([steps, index]) => ({ current: index + 1, total: steps.length })),
  );

  isFirstStep$ = this.index$.pipe(map((index) => index === 0));

  isLastStep$ = combineLatest([this.steps$, this.index$]).pipe(
    map(([steps, index]) => index === steps.length - 1),
  );

  registerAnchor(anchorId: string, element: ElementRef): void {
    this.anchors.set(anchorId, element);
  }

  unregisterAnchor(anchorId: string): void {
    this.anchors.delete(anchorId);
  }

  getAnchorElement(anchorId: string): ElementRef | undefined {
    return this.anchors.get(anchorId);
  }

  start(steps: TourStep[]): void {
    if (steps.length === 0) return;

    this.stepsSubject.next(steps);
    this.indexSubject.next(0);
    this.activeSubject.next(true);
  }

  next(): void {
    const nextIndex = this.indexSubject.value + 1;
    if (nextIndex >= this.stepsSubject.value.length) {
      this.finish();
      return;
    }

    this.indexSubject.next(nextIndex);
  }

  previous(): void {
    this.indexSubject.next(Math.max(0, this.indexSubject.value - 1));
  }

  skip(): void {
    this.finish();
  }

  finish(): void {
    this.activeSubject.next(false);
    this.stepsSubject.next([]);
    this.indexSubject.next(0);
  }
}
