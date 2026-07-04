import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, of, catchError } from 'rxjs';
import { ResultEntity } from '../models/result-entity.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { ConfirmEmailResponse } from '../models/auth/confirm-email-response.model';
import { ResendCodeResponse } from '../models/auth/resend-code-response.model';
import { RequestPasswordResetResponse } from '../models/auth/request-password-reset-response.model';
import { ValidateResetCodeResponse } from '../models/auth/validate-reset-code-response.model';
import { ResetPasswordResponse } from '../models/auth/reset-password-response.model';
import { RefreshTokenResponse } from '../models/auth/refresh-token-response.model';
import { LogoutResponse } from '../models/auth/logout-response.model';
import { environment } from '../../../environments/environment';
import { ConfigService } from './config.service';
import { BaseService } from '../bases/base/base-service';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBERED_EMAIL_KEY = 'remembered_email';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService  {


  login(email: string, password: string, rememberMe = false): Observable<ResultEntity<LoginResponse>> {
    return this.http
      .post<ResultEntity<LoginResponse>>(`${this.url}/auth/login`, { email, password, rememberMe })
      .pipe(
        tap((result) => {
          if (result.isSuccess && result.value) {
            this.setToken(result.value.accessToken);
            this.setRememberedEmail(email);

            if (rememberMe && result.value.refreshToken) {
              this.setRefreshToken(result.value.refreshToken);
            }
          }
        })
      );
  }

  refresh(): Observable<ResultEntity<RefreshTokenResponse>> {
    const refreshToken = this.getRefreshToken();

    return this.http
      .post<ResultEntity<RefreshTokenResponse>>(`${this.url}/auth/refresh`, { refreshToken })
      .pipe(
        tap((result) => {
          if (result.isSuccess && result.value) {
            this.setToken(result.value.accessToken);
            this.setRefreshToken(result.value.refreshToken);
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

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();

    const request$: Observable<ResultEntity<LogoutResponse> | null> = refreshToken
      ? this.http.post<ResultEntity<LogoutResponse>>(`${this.url}/auth/logout`, { refreshToken })
      : of(null);

    return request$.pipe(
      catchError(() => of(null)),
      tap(() => this.clearSession()),
      map(() => void 0),
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getRememberedEmail(): string | null {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  private setRememberedEmail(email: string): void {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
