import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
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
      <app-ai-chat-widget *ngIf="mode === 'ai'"></app-ai-chat-widget>
      <app-assistant-widget *ngIf="mode === 'basic'"></app-assistant-widget>
    </ng-container>
  `,
})
export class AssistantSwitcherComponent {
  private aiService = inject(AiService);

  mode$ = this.aiService.getStatus().pipe(
    map((res): AssistantMode => (res.isSuccess && res.value?.enabled ? 'ai' : 'basic')),
    catchError(() => of<AssistantMode>('basic')),
    shareReplay(1),
  );
}
