import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { ResultEntity } from '../models/result-entity.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<ResultEntity<LoginResponse>> {
    return this.http
      .post<ResultEntity<LoginResponse>>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((result) => {
          if (result.isSuccess && result.value) {
            this.setToken(result.value.accessToken);
          }
        })
      );
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
