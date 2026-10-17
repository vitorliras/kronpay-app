import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, catchError, finalize, of, shareReplay, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { ResultEntity } from '../models/result-entity.model';
import { RefreshTokenResponse } from '../models/auth/refresh-token-response.model';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { ConfigService } from '../services/config.service';

let refreshInFlight$: Observable<ResultEntity<RefreshTokenResponse>> | null = null;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const dialog = inject(MatDialog);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);
  const translate = inject(TranslationService);
  const settings = inject(ConfigService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const connection = localStorage.getItem('connection');

      if (connection) {
        if(authService.isAuthenticated())
        authService.logout().subscribe();
        router.navigate(['/auth/login']);
      }

      if (error.error && typeof error.error === 'object') {
        const result = error.error as ResultEntity<any>;

        if (error.error.isSuccess === false){
           return of(
          new HttpResponse({
            body: {
              isSuccess: false,
              message: error.error.message,
            } as ResultEntity<any>,
            status: 200,
          }),
        );
        }

        return throwError(() => result);
      }

      if (error.status === 0) {
        return of(
          new HttpResponse({
            body: {
              isSuccess: false,
              message: 'ConnectionError',
            } as ResultEntity<any>,
            status: 200,
          }),
        );
      }

      if ((error.status === 401 || error.status === 403) && settings.isApiUrl(req.url)) {
        const expireSession = () =>
          authService.logout().pipe(
            switchMap(() => {
              dialog.closeAll();
              translate.getByKey('ExpiredToken').subscribe((message) => {
                toastr.error(message);
              });
              router.navigate(['/auth/login']);
              return throwError(() => error);
            }),
          );

        const currentToken = authService.getToken();
        if (currentToken && req.headers.get('Authorization') !== `Bearer ${currentToken}`) {
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${currentToken}` } }));
        }

        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
          return expireSession();
        }

        if (!refreshInFlight$) {
          refreshInFlight$ = authService.refresh().pipe(
            finalize(() => (refreshInFlight$ = null)),
            shareReplay(1),
          );
        }

        return refreshInFlight$.pipe(
          switchMap((result) => {
            if (result.isSuccess && result.value) {
              const retriedRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${result.value.accessToken}` },
              });
              return next(retriedRequest);
            }

            return expireSession();
          }),
          catchError(() => expireSession()),
        );
      }

      return throwError(() => error);
    }),
  );
};
