import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Base } from '../../../core/bases/base/base';

const DIGIT_COUNT = 6;

@Component({
  selector: 'app-code-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './code-input.html',
  styleUrl: './code-input.scss',
})
export class CodeInput extends Base implements OnChanges, OnDestroy {
  private static readonly RESEND_COOLDOWN_SECONDS = 30;

  @Input({ required: true }) control!: FormControl;
  @Input() expiresAt: Date | null = null;
  @Output() resend = new EventEmitter<void>();
  @Output() codeComplete = new EventEmitter<string>();

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = Array(DIGIT_COUNT).fill('');
  remainingSeconds = 0;
  resendCooldownRemaining = 0;
  private totalSeconds = 0;
  private sentAt = Date.now();
  private timerId?: ReturnType<typeof setInterval>;
  private lastEmittedCode = '';
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expiresAt']) {
      this.sentAt = Date.now();
      this.restartCountdown();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  get canResend(): boolean {
    return this.resendCooldownRemaining <= 0;
  }

  get isExpired(): boolean {
    return !!this.expiresAt && this.remainingSeconds <= 0;
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get ringProgress(): number {
    if (!this.totalSeconds) return 0;
    return Math.max(Math.min(this.remainingSeconds / this.totalSeconds, 1), 0);
  }

  get ringUrgency(): 'calm' | 'warning' | 'critical' {
    if (this.ringProgress <= 0.2) return 'critical';
    if (this.ringProgress <= 0.5) return 'warning';
    return 'calm';
  }

  onResendClick(): void {
    if (!this.canResend) return;
    this.digits = Array(DIGIT_COUNT).fill('');
    this.lastEmittedCode = '';
    this.control.setValue('');
    this.resend.emit();
    queueMicrotask(() => this.focusDigit(0));
  }

  onDigitInput(index: number, rawValue: string): void {
    const sanitized = rawValue.replace(/\D/g, '').slice(-1);
    this.digits[index] = sanitized;
    this.syncControl();

    if (sanitized && index < DIGIT_COUNT - 1) {
      this.focusDigit(index + 1);
    }
  }

  onDigitKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.digits[index - 1] = '';
      this.syncControl();
      this.focusDigit(index - 1);
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      this.focusDigit(index - 1);
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowRight' && index < DIGIT_COUNT - 1) {
      this.focusDigit(index + 1);
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
    if (!pasted) return;

    event.preventDefault();
    const chars = pasted.slice(0, DIGIT_COUNT).split('');
    this.digits = Array(DIGIT_COUNT)
      .fill('')
      .map((_, i) => chars[i] ?? '');
    this.syncControl();

    const nextEmptyIndex = this.digits.findIndex((d) => !d);
    this.focusDigit(nextEmptyIndex === -1 ? DIGIT_COUNT - 1 : nextEmptyIndex);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private focusDigit(index: number): void {
    setTimeout(() => {
      const target = this.digitInputs?.get(index);
      target?.nativeElement.focus();
      target?.nativeElement.select();
    });
  }

  private syncControl(): void {
    const code = this.digits.join('');
    this.control.setValue(code);

    if (code.length === DIGIT_COUNT && !this.digits.includes('') && code !== this.lastEmittedCode) {
      this.lastEmittedCode = code;
      this.control.markAsTouched();
      this.codeComplete.emit(code);
    }
  }

  private restartCountdown(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.totalSeconds = this.expiresAt
      ? Math.max(Math.round((this.expiresAt.getTime() - this.sentAt) / 1000), 1)
      : 0;
    setTimeout(() => this.tick());
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (!this.expiresAt) {
      this.remainingSeconds = 0;
    } else {
      const diffMs = this.expiresAt.getTime() - Date.now();
      this.remainingSeconds = Math.max(Math.floor(diffMs / 1000), 0);
    }

    const cooldownDiffMs =
      this.sentAt + CodeInput.RESEND_COOLDOWN_SECONDS * 1000 - Date.now();
    this.resendCooldownRemaining = Math.max(Math.ceil(cooldownDiffMs / 1000), 0);

    this.cdr.detectChanges();
  }
}
