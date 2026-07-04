import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Base } from '../../../core/bases/base/base';
import { passwordValidator } from '../../../core/validators/password.validator';
import { cpfValidator } from '../../../core/validators/cpf.validator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';
import { CreateUserRequest } from '../../../core/models/users/create-user-request.model';
import { UserService } from '../../../core/services/user.service';
import { CodeInput } from '../../../shared/components/code-input/code-input';
import { MaskedPasswordDirective } from '../../../shared/directives/masked-password.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const CODE_VALIDITY_MS = 2 * 60 * 1000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatTooltipModule,
    NgxMaskDirective,
    CodeInput,
    MaskedPasswordDirective,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login extends Base {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  currentView = 'login';

  registeredEmail = '';
  resetEmail = '';
  codeExpiresAt: Date | null = null;
  resetCodeValidated = false;
  isLoading = false;

  constructor() {
    super();

    var conection = localStorage.getItem('connection');
    if (conection) {
      localStorage.setItem('connection', '');

      const maintenanceMessage = `
          <div style="text-align: center; line-height: 1.5;">
            <strong>⚠️ Maintenance in progress</strong><br />
            Our services are currently under maintenance.<br />
            Please wait a moment.<br /><br />

            <strong>⚠️ Manutenção em andamento</strong><br />
            Nossos serviços estão em manutenção no momento.<br />
            Por favor, aguarde um instante.
          </div>
        `;
      this.confirmModal(
        'Atenção - Attention',
        maintenanceMessage,
        '',
        '',
        '600',
        'info',
      ).subscribe();

      setTimeout(() => {
        window.location.reload();
      }, 40000);
    }
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, cpfValidator]],
    phone: ['', [Validators.required]],
    password: ['', passwordValidator],
  });

  confirmEmailForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetPasswordForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', passwordValidator],
    confirmPassword: ['', Validators.required],
  });

  hidePassword = true;
  loading = false;
  errorMessage: string | null = null;
  passwordRules$ = this.translations$.pipe(map((t) => t?.['PasswordRules']));

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  goToLogin() {
    this.currentView = 'login';
  }

  goToRegister() {
    this.currentView = 'register';
  }

  goToForgotPassword() {
    this.forgotForm.reset();
    this.currentView = 'forgot';
  }

  submit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        if (res.isSuccess && res.value) {
          this.toastr.success(res.message);
          localStorage.setItem('access_token', res.value.accessToken);
          this.router.navigate(['/dashboard']);
          return;
        }

        this.toastr.warning(res.message);
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.value;

    const payload: CreateUserRequest = {
      name: formValue.name!,
      username: formValue.username!,
      email: formValue.email!,
      cpf: formValue.cpf!.replace(/\D/g, ''),
      phone: formValue.phone!.replace(/\D/g, ''),
      password: formValue.password!,
    };

    this.userService.create(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.registeredEmail = payload.email;
          this.confirmEmailForm.reset();
          this.codeExpiresAt = new Date(Date.now() + CODE_VALIDITY_MS);
          this.currentView = 'confirm-email';
          // Força a atualização da view: uma pendência pré-existente no template
          // (fora do escopo desta tarefa) impede o ciclo automático de change
          // detection de rodar após callbacks assíncronos de HTTP.
          this.cdr.detectChanges();
          return;
        }

        this.toastr.warning(res.message);
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
      },
    });
  }

  confirmEmail() {
    this.isLoading = true;
    this.cdr.detectChanges();

    if (this.confirmEmailForm.invalid) {
      this.confirmEmailForm.markAllAsTouched();
      return;
    }

    const { code } = this.confirmEmailForm.value;

    this.auth.confirmEmail(this.registeredEmail, code!).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.goToLogin();
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
        this.toastr.warning(res.message);
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  resendConfirmationCode() {
    this.auth.resendConfirmationCode(this.registeredEmail).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.codeExpiresAt = new Date(Date.now() + CODE_VALIDITY_MS);
          this.cdr.detectChanges();
          return;
        }

        this.toastr.warning(res.message);
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
      },
    });
  }

  requestPasswordReset() {
    this.isLoading = true;
    this.cdr.detectChanges();

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const { email } = this.forgotForm.value;

    this.auth.requestPasswordReset(email!).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.resetEmail = email!;
        this.resetCodeValidated = false;
        this.resetPasswordForm.reset();
        this.codeExpiresAt = new Date(Date.now() + CODE_VALIDITY_MS);
        this.currentView = 'reset-password';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  resendPasswordResetCode() {
    this.auth.requestPasswordReset(this.resetEmail).subscribe({
      next: (res) => {
        this.toastr.success(res.message);
        this.codeExpiresAt = new Date(Date.now() + CODE_VALIDITY_MS);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
      },
    });
  }

  onResetPasswordFormSubmit() {
    if (this.resetCodeValidated) {
      this.resetPassword();
      return;
    }

    this.validateResetCode();
  }

  validateResetCode() {
    const code = this.resetPasswordForm.controls.code.value;
    if (!code || this.resetPasswordForm.controls.code.invalid) {
      this.resetPasswordForm.controls.code.markAsTouched();
      return;
    }

    this.auth.validateResetCode(this.resetEmail, code).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.resetCodeValidated = true;
          this.cdr.detectChanges();
          return;
        }

        this.toastr.warning(res.message);
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
      },
    });
  }

  resetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const { code, newPassword, confirmPassword } = this.resetPasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.messageWarning('PasswordsDoNotMatch');
      return;
    }

    this.auth.resetPassword(this.resetEmail, code!, newPassword!, confirmPassword!).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.goToLogin();
          this.cdr.detectChanges();
          return;
        }

        this.toastr.warning(res.message);
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
      },
    });
  }
}
