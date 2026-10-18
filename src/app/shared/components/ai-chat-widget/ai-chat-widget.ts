import { AfterViewChecked, Component, ElementRef, ViewChild, inject } from '@angular/core';
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
import { AiService } from '../../../core/services/ai.service';
import { AiStatusResponse } from '../../../core/models/ai/ai-status-response.model';
import { allowedImportExtensions, importAcceptAttribute } from '../../../core/utils/ai-file-extensions';
import { CardInvoiceService } from '../../../core/services/card-invoice.service';

const EXPANDED_KEY = 'aiChatExpanded';
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_FILES_PER_MESSAGE = 3;
const MAX_FILES_PER_CONVERSATION = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

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
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  private aiChatService = inject(AiChatService);
  private invoiceService = inject(CardInvoiceService);
  private actionModal = inject(AiActionModalService);
  private aiService = inject(AiService);
  private toastr = inject(ToastrService);

  private shouldScroll = false;
  private started = false;
  private lastUserText = '';
  private attachmentIds: string[] = [];
  private aiStatus: AiStatusResponse | null = null;

  acceptAttribute = importAcceptAttribute(null);

  private pendingFilesSubject = new BehaviorSubject<File[]>([]);
  pendingFiles$ = this.pendingFilesSubject.asObservable();

  private isUploadingSubject = new BehaviorSubject<boolean>(false);
  isUploading$ = this.isUploadingSubject.asObservable();

  isDragging = false;

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
      this.loadAiStatus();
    }
  }

  private loadAiStatus(): void {
    this.aiService.getStatus().subscribe({
      next: (res) => {
        if (!res.isSuccess) return;

        this.aiStatus = res.value ?? null;
        this.acceptAttribute = importAcceptAttribute(this.aiStatus);
      },
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  removePendingFile(file: File): void {
    this.pendingFilesSubject.next(this.pendingFilesSubject.value.filter((f) => f !== file));
  }

  private async addFiles(files: File[]): Promise<void> {
    if (files.length === 0) return;

    const t = await firstValueFrom(this.translations$);
    const allowed = allowedImportExtensions(this.aiStatus);
    const current = this.pendingFilesSubject.value;
    const accepted: File[] = [];

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

      if (!allowed.includes(extension)) {
        this.toastr.warning(t['AllowedFiles']);
        continue;
      }

      if (file.size > MAX_FILE_BYTES) {
        this.toastr.warning(t['ChatAttachmentTooLarge']);
        continue;
      }

      if (
        current.length + accepted.length >= MAX_FILES_PER_MESSAGE ||
        this.attachmentIds.length + current.length + accepted.length >= MAX_FILES_PER_CONVERSATION
      ) {
        this.toastr.warning(t['ChatAttachmentTooMany']);
        break;
      }

      accepted.push(file);
    }

    if (accepted.length > 0) this.pendingFilesSubject.next([...current, ...accepted]);
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
    this.attachmentIds = [];
    this.pendingFilesSubject.next([]);
    this.isLoadingSubject.next(false);
    this.lastUserText = '';
    this.loadStarters();
  }

  sendTyped(): void {
    const text = this.inputControl.value.trim();
    const files = this.pendingFilesSubject.value;
    if (!text && files.length === 0) return;

    this.inputControl.reset('');

    if (files.length > 0) {
      void this.sendWithFiles(text, files);
      return;
    }

    this.send(text);
  }

  private async sendWithFiles(text: string, files: File[]): Promise<void> {
    if (this.isLoadingSubject.value) return;

    this.pendingFilesSubject.next([]);

    const t = await firstValueFrom(this.translations$);
    const content = text || t['AiChatDefaultAttachmentMessage'];

    this.appendBubble({ ...this.userBubble(content), attachmentNames: files.map((f) => f.name) });
    this.isLoadingSubject.next(true);
    this.isUploadingSubject.next(true);
    this.shouldScroll = true;

    try {
      const res = await firstValueFrom(this.aiChatService.uploadAttachments(files));

      if (!res.isSuccess || !res.value) {
        this.appendBubble(this.errorBubble(res.message ?? ''));
        this.isLoadingSubject.next(false);
        return;
      }

      this.attachmentIds = [...this.attachmentIds, ...res.value.attachments.map((a) => a.id)];

      if (res.value.unreadableFiles.length > 0) {
        this.appendBubble({
          ...this.errorBubble(`${t['AiChatSomeFilesUnreadable']} ${res.value.unreadableFiles.join(', ')}`),
          isError: false,
        });
      }
    } catch {
      this.appendBubble(this.errorBubble(''));
      this.isLoadingSubject.next(false);
      return;
    } finally {
      this.isUploadingSubject.next(false);
    }

    this.lastUserText = content;
    this.request();
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

    this.aiChatService
      .send({ messages: this.buildHistory(), attachmentIds: this.attachmentIds })
      .subscribe({
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
      attachmentNames: [],
      text: response.reply,
      suggestions: response.suggestions ?? [],
      actions: response.actions ?? [],
      payment: payment ? { proposal: payment, status: 'idle' } : null,
      isError: false,
      inHistory: true,
    });

    this.runNavigateNow(response.actions ?? []);
    this.runModalAction(response.actions ?? []);
  }

  private runNavigateNow(actions: AiChatAction[]): void {
    const action = actions.find((a) => a.type === 'navigate_now');
    if (!action?.path) return;

    this.router.navigate([action.path], { queryParams: action.queryParams ?? undefined });
  }

  private async runModalAction(actions: AiChatAction[]): Promise<void> {
    const action = actions.find((a) => this.actionModal.isModalAction(a));
    if (!action) return;

    const saved = await this.actionModal.run(action);
    const t = await firstValueFrom(this.translations$);

    this.appendBubble({
      id: this.generateId(),
      role: 'assistant',
      attachmentNames: [],
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
      attachmentNames: [],
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
      attachmentNames: [],
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
