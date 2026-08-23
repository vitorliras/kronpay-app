import { AfterViewChecked, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';
import { Base } from '../../../core/bases/base/base';
import { AssistantService } from '../../../core/services/assistant.service';
import { AskAssistantRequest } from '../../../core/models/assistant/ask-assistant-request.model';
import { AssistantNodeResponse } from '../../../core/models/assistant/assistant-node-response.model';
import { AssistantOptionResponse } from '../../../core/models/assistant/assistant-option-response.model';
import { AssistantNavigationResponse } from '../../../core/models/assistant/assistant-navigation-response.model';
import { AssistantChatMessage } from './assistant-chat-message.model';

const FREE_TEXT_OPTION_ID = 'free-text';

@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './assistant-widget.html',
  styleUrl: './assistant-widget.scss',
})
export class AssistantWidgetComponent extends Base implements AfterViewChecked {
  private assistantService = inject(AssistantService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  private shouldScroll = false;

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private messagesSubject = new BehaviorSubject<AssistantChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  freeTextControl = new FormControl('', { nonNullable: true });

  private currentNode: AssistantNodeResponse | null = null;
  private started = false;

  constructor() {
    super();
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScroll) return;

    this.shouldScroll = false;
    const el = this.scrollContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  togglePanel(): void {
    const next = !this.isOpenSubject.value;
    this.isOpenSubject.next(next);

    if (next && !this.started) {
      this.started = true;
      this.fetchNode({ currentNodeId: null, selectedOptionId: null, freeText: null });
    }
  }

  restartConversation(): void {
    this.messagesSubject.next([]);
    this.currentNode = null;
    this.fetchNode({ currentNodeId: null, selectedOptionId: null, freeText: null });
  }

  selectOption(option: AssistantOptionResponse): void {
    if (this.isLoadingSubject.value) return;

    this.pushUserMessage(option.labelKey);
    this.fetchNode({
      currentNodeId: this.currentNode?.nodeId ?? null,
      selectedOptionId: option.id,
      freeText: null,
    });
  }

  sendFreeText(): void {
    if (this.isLoadingSubject.value) return;

    const text = this.freeTextControl.value.trim();
    if (!text) return;

    this.pushUserMessage(text);
    this.freeTextControl.reset('');
    this.fetchNode({
      currentNodeId: this.currentNode?.nodeId ?? null,
      selectedOptionId: null,
      freeText: text,
    });
  }

  visibleOptions(options: AssistantOptionResponse[]): AssistantOptionResponse[] {
    return options.filter((option) => option.id !== FREE_TEXT_OPTION_ID);
  }

  isBackOption(option: AssistantOptionResponse): boolean {
    return option.id === 'back';
  }

  openNavigateTo(navigateTo: AssistantNavigationResponse): void {
    this.router.navigate([navigateTo.path], { queryParams: navigateTo.queryParams });
    this.isOpenSubject.next(false);
  }

  manualNavigations(navigateTo: AssistantNavigationResponse[] | null): AssistantNavigationResponse[] {
    return (navigateTo ?? []).filter((nav) => !nav.autoNavigate);
  }

  private fetchNode(request: AskAssistantRequest): void {
    this.isLoadingSubject.next(true);
    this.shouldScroll = true;

    this.assistantService.ask(request).subscribe({
      next: (result) => {
        this.isLoadingSubject.next(false);

        if (!result.isSuccess || !result.value) {
          this.messageError(result.message ?? 'OperationFailed');
          return;
        }

        this.currentNode = result.value;
        this.pushAssistantMessage(result.value);

        const autoNavigate = result.value.navigateTo?.find((nav) => nav.autoNavigate);
        if (autoNavigate) {
          this.openNavigateTo(autoNavigate);
        }
      },
      error: () => {
        this.isLoadingSubject.next(false);
        this.messageError('OperationFailed');
      },
    });
  }

  private pushUserMessage(text: string): void {
    this.appendMessage({ id: this.generateId(), role: 'user', text, options: [], isFinal: false, navigateTo: null });
  }

  private pushAssistantMessage(node: AssistantNodeResponse): void {
    this.appendMessage({
      id: this.generateId(),
      role: 'assistant',
      text: node.messageKey,
      options: this.visibleOptions(node.options),
      isFinal: node.isFinal,
      navigateTo: node.navigateTo,
    });
  }

  private appendMessage(message: AssistantChatMessage): void {
    this.messagesSubject.next([...this.messagesSubject.value, message]);
    this.shouldScroll = true;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
