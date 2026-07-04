import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { ResultEntity } from '../models/result-entity.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { ConfirmEmailResponse } from '../models/auth/confirm-email-response.model';
import { ResendCodeResponse } from '../models/auth/resend-code-response.model';
import { RequestPasswordResetResponse } from '../models/auth/request-password-reset-response.model';
import { ValidateResetCodeResponse } from '../models/auth/validate-reset-code-response.model';
import { ResetPasswordResponse } from '../models/auth/reset-password-response.model';
import { environment } from '../../../environments/environment';
import { ConfigService } from './config.service';
import { BaseService } from '../bases/base/base-service';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService  {


  login(email: string, password: string): Observable<ResultEntity<LoginResponse>> {
    return this.http
      .post<ResultEntity<LoginResponse>>(`${this.url}/auth/login`, { email, password })
      .pipe(
        tap((result) => {
          if (result.isSuccess && result.value) {
            this.setToken(result.value.accessToken);
          }
        })
      );
  }

  confirmEmail(email: string, code: string): Observable<ResultEntity<ConfirmEmailResponse>> {
    return this.http.post<ResultEntity<ConfirmEmailResponse>>(
      `${this.url}/auth/confirm-email`,
      { email, code },
    );
  }

  resendConfirmationCode(email: string): Observable<ResultEntity<ResendCodeResponse>> {
    return this.http.post<ResultEntity<ResendCodeResponse>>(
      `${this.url}/auth/resend-confirmation`,
      { email },
    );
  }

  requestPasswordReset(email: string): Observable<ResultEntity<RequestPasswordResetResponse>> {
    return this.http.post<ResultEntity<RequestPasswordResetResponse>>(
      `${this.url}/auth/forgot-password`,
      { email },
    );
  }

  validateResetCode(email: string, code: string): Observable<ResultEntity<ValidateResetCodeResponse>> {
    return this.http.post<ResultEntity<ValidateResetCodeResponse>>(
      `${this.url}/auth/validate-reset-code`,
      { email, code },
    );
  }

  resetPassword(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
  ): Observable<ResultEntity<ResetPasswordResponse>> {
    return this.http.post<ResultEntity<ResetPasswordResponse>>(`${this.url}/auth/reset-password`, {
      email,
      code,
      newPassword,
      confirmPassword,
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }
}
