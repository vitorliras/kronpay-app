import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ResultEntity } from '../models/result-entity.model';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);
  const translate = inject(TranslationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error && typeof error.error === 'object') {
        const result = error.error as ResultEntity<any>;

        return of(
          new HttpResponse({
            body: result,
            status: error.status,
            statusText: error.statusText,
            url: error.url ?? undefined,
          }),
        );
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

      if (error.status === 401 || error.status === 403) {
        authService.logout();

        translate.getByKey('ExpiredToken').subscribe((message) => {
          toastr.error(message);
        });
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
