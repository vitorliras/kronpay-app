import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Base } from '../../../core/bases/base/base';

@Component({
  selector: 'app-code-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './code-input.html',
  styleUrl: './code-input.scss',
})
export class CodeInput extends Base implements OnChanges, OnDestroy {
  private static readonly RESEND_COOLDOWN_SECONDS = 30;

  @Input({ required: true }) control!: FormControl;
  @Input() expiresAt: Date | null = null;
  @Output() resend = new EventEmitter<void>();

  remainingSeconds = 0;
  resendCooldownRemaining = 0;
  private sentAt = Date.now();
  private timerId?: ReturnType<typeof setInterval>;
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

  get formattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onResendClick(): void {
    if (this.canResend) this.resend.emit();
  }

  private restartCountdown(): void {
    if (this.timerId) clearInterval(this.timerId);
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
