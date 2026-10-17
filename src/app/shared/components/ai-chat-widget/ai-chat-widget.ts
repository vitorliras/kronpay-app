import { AfterViewChecked, Component, ElementRef, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Base } from '../../../core/bases/base/base';
import { AiChatAction } from '../../../core/models/ai-chat/ai-chat-action.model';
import { AiChatBubble } from '../../../core/models/ai-chat/ai-chat-bubble.model';
import { AiChatMessage } from '../../../core/models/ai-chat/ai-chat-message.model';
import { AiChatResponse } from '../../../core/models/ai-chat/ai-chat-response.model';
import { PaymentMethodOption } from '../../../core/models/ai-chat/payment-method-option.model';
import { PayCardInvoiceRequest } from '../../../core/models/card/card-invoice';
import { AiChatService } from '../../../core/services/ai-chat.service';
import { AiActionModalService } from '../../../core/services/ai-action-modal.service';
import { CardInvoiceService } from '../../../core/services/card-invoice.service';

const EXPANDED_KEY = 'aiChatExpanded';
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 1000;

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './ai-chat-widget.html',
  styleUrls: ['../assistant-widget/assistant-widget.scss', './ai-chat-widget.scss'],
})
export class AiChatWidgetComponent extends Base implements AfterViewChecked {
  @Output() useBasic = new EventEmitter<void>();

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  private aiChatService = inject(AiChatService);
  private invoiceService = inject(CardInvoiceService);
  private actionModal = inject(AiActionModalService);
  private toastr = inject(ToastrService);

  private shouldScroll = false;
  private started = false;
  private lastUserText = '';

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private expandedSubject = new BehaviorSubject<boolean>(this.readExpanded());
  expanded$ = this.expandedSubject.asObservable();

  private bubblesSubject = new BehaviorSubject<AiChatBubble[]>([]);
  bubbles$ = this.bubblesSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private startersSubject = new BehaviorSubject<string[]>([]);
  starters$ = this.startersSubject.asObservable();

  inputControl = new FormControl('', { nonNullable: true });

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
      this.loadStarters();
    }
  }

  toggleExpanded(): void {
    const next = !this.expandedSubject.value;
    this.expandedSubject.next(next);
    this.shouldScroll = true;

    try {
      localStorage.setItem(EXPANDED_KEY, String(next));
    } catch {}
  }

  newConversation(): void {
    this.bubblesSubject.next([]);
    this.isLoadingSubject.next(false);
    this.lastUserText = '';
    this.loadStarters();
  }

  sendTyped(): void {
    const text = this.inputControl.value.trim();
    if (!text) return;

    this.inputControl.reset('');
    this.send(text);
  }

  sendSuggestion(text: string): void {
    this.send(text);
  }

  retry(): void {
    if (!this.lastUserText || this.isLoadingSubject.value) return;

    this.removeErrorBubbles();
    this.request();
  }

  isLatestAssistant(bubble: AiChatBubble): boolean {
    const bubbles = this.bubblesSubject.value;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (bubbles[i].role === 'assistant') return bubbles[i].id === bubble.id;
    }

    return false;
  }

  runAction(action: AiChatAction): void {
    if (!action.path) return;

    this.router.navigate([action.path], { queryParams: action.queryParams ?? undefined });
    this.isOpenSubject.next(false);
  }

  actionIcon(action: AiChatAction): string {
    return action.type === 'start_tour' ? 'tour' : 'open_in_new';
  }

  manualActions(bubble: AiChatBubble): AiChatAction[] {
    return bubble.actions.filter((a) => a.type === 'navigate' || a.type === 'start_tour');
  }

  payWith(bubble: AiChatBubble, method: PaymentMethodOption): void {
    const payment = bubble.payment;
    if (!payment || payment.status !== 'idle') return;

    this.updateBubble(bubble.id, { payment: { ...payment, status: 'paying' } });

    const request: PayCardInvoiceRequest = {
      cardInvoiceId: payment.proposal.cardInvoiceId,
      paymentMethodId: method.id,
      codTypeTransaction: 'E',
    };

    this.invoiceService.pay(request).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.updateBubble(bubble.id, { payment: { ...payment, status: 'paid' } });
          this.toastr.success(res.message);
          this.actionModal.navigateTo('/credit-card/invoices', {
            cardId: String(payment.proposal.creditCardId),
          });
          return;
        }

        this.updateBubble(bubble.id, { payment: { ...payment, status: 'idle' } });
        this.toastr.warning(res.message);
      },
      error: () => {
        this.updateBubble(bubble.id, { payment: { ...payment, status: 'idle' } });
      },
    });
  }

  formatDueDate(value: string): string {
    return new Date(value).toLocaleDateString(this.currentLang);
  }

  private send(text: string): void {
    if (this.isLoadingSubject.value) return;

    const pending = this.pendingPaymentBubble();
    const method = pending ? this.matchPaymentMethod(pending, text) : null;

    this.appendBubble(this.userBubble(text));

    if (pending && method) {
      this.payWith(pending, method);
      return;
    }

    this.lastUserText = text;
    this.request();
  }

  private request(): void {
    this.isLoadingSubject.next(true);
    this.shouldScroll = true;

    this.aiChatService.send({ messages: this.buildHistory() }).subscribe({
      next: (res) => {
        this.isLoadingSubject.next(false);

        if (!res.isSuccess || !res.value) {
          this.appendBubble(this.errorBubble(res.message ?? ''));
          return;
        }

        this.receive(res.value);
      },
      error: () => {
        this.isLoadingSubject.next(false);
        this.appendBubble(this.errorBubble(''));
      },
    });
  }

  private receive(response: AiChatResponse): void {
    const payment = response.actions.find((a) => a.type === 'confirm_invoice_payment')?.invoicePayment ?? null;

    this.appendBubble({
      id: this.generateId(),
      role: 'assistant',
      text: response.reply,
      suggestions: response.suggestions ?? [],
      actions: response.actions ?? [],
      payment: payment ? { proposal: payment, status: 'idle' } : null,
      isError: false,
      inHistory: true,
    });

    this.runModalAction(response.actions ?? []);
  }

  private async runModalAction(actions: AiChatAction[]): Promise<void> {
    const action = actions.find((a) => this.actionModal.isModalAction(a));
    if (!action) return;

    const saved = await this.actionModal.run(action);
    const t = await firstValueFrom(this.translations$);

    this.appendBubble({
      id: this.generateId(),
      role: 'assistant',
      text: saved ? t['AiChatSaved'] : t['AiChatCancelled'],
      suggestions: [],
      actions: [],
      payment: null,
      isError: false,
      inHistory: true,
    });
  }

  private loadStarters(): void {
    this.startersSubject.next([]);

    this.aiChatService.getStarters().subscribe({
      next: async (res) => {
        if (!res.isSuccess || !res.value) return;

        const t = await firstValueFrom(this.translations$);

        this.startersSubject.next(
          res.value.starters.map((s) => (t[s.messageKey] ?? s.messageKey).replace('{0}', s.arg ?? '')),
        );
      },
    });
  }

  private buildHistory(): AiChatMessage[] {
    return this.bubblesSubject.value
      .filter((b) => b.inHistory && !b.isError && b.text.trim().length > 0)
      .slice(-MAX_HISTORY)
      .map((b) => ({ role: b.role, content: b.text.slice(0, MAX_MESSAGE_LENGTH) }));
  }

  private pendingPaymentBubble(): AiChatBubble | null {
    const bubbles = this.bubblesSubject.value;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (bubbles[i].payment?.status === 'idle') return bubbles[i];
    }

    return null;
  }

  private matchPaymentMethod(bubble: AiChatBubble, text: string): PaymentMethodOption | null {
    const wanted = this.normalize(text);

    return (
      bubble.payment?.proposal.paymentMethods.find((m) => this.normalize(m.description) === wanted) ?? null
    );
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase();
  }

  private userBubble(text: string): AiChatBubble {
    return {
      id: this.generateId(),
      role: 'user',
      text,
      suggestions: [],
      actions: [],
      payment: null,
      isError: false,
      inHistory: true,
    };
  }

  private errorBubble(message: string): AiChatBubble {
    return {
      id: this.generateId(),
      role: 'assistant',
      text: message || 'AiChatFailed',
      suggestions: [],
      actions: [],
      payment: null,
      isError: true,
      inHistory: false,
    };
  }

  private removeErrorBubbles(): void {
    this.bubblesSubject.next(this.bubblesSubject.value.filter((b) => !b.isError));
  }

  private appendBubble(bubble: AiChatBubble): void {
    this.bubblesSubject.next([...this.bubblesSubject.value, bubble]);
    this.shouldScroll = true;
  }

  private updateBubble(id: string, changes: Partial<AiChatBubble>): void {
    this.bubblesSubject.next(
      this.bubblesSubject.value.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    );
  }

  private readExpanded(): boolean {
    try {
      return localStorage.getItem(EXPANDED_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
