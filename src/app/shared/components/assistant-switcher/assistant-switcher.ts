import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { catchError, of, shareReplay } from 'rxjs';
import { AiService } from '../../../core/services/ai.service';
import { AiChatWidgetComponent } from '../ai-chat-widget/ai-chat-widget';
import { AssistantWidgetComponent } from '../assistant-widget/assistant-widget';

type AssistantMode = 'ai' | 'basic';

@Component({
  selector: 'app-assistant-switcher',
  standalone: true,
  imports: [CommonModule, AiChatWidgetComponent, AssistantWidgetComponent],
  template: `
    <ng-container *ngIf="mode$ | async as mode">
      <app-ai-chat-widget *ngIf="mode === 'ai'" (useBasic)="useBasic()"></app-ai-chat-widget>
      <app-assistant-widget *ngIf="mode === 'basic'"></app-assistant-widget>
    </ng-container>
  `,
})
export class AssistantSwitcherComponent {
  private aiService = inject(AiService);
  private forcedBasic = new BehaviorSubject<boolean>(false);

  private status$ = this.aiService.getStatus().pipe(
    map((res) => (res.isSuccess ? (res.value ?? null) : null)),
    catchError(() => of(null)),
    shareReplay(1),
  );

  mode$ = combineLatest([this.status$, this.forcedBasic]).pipe(
    map(([status, forced]): AssistantMode => (status?.enabled && !forced ? 'ai' : 'basic')),
  );

  useBasic(): void {
    this.forcedBasic.next(true);
  }
}
