import { Component, inject } from '@angular/core';
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
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login extends Base {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  currentView = 'login';

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
          this.goToLogin();
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
