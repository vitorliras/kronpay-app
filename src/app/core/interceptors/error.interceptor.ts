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
      var connection = localStorage.getItem('connection');

      if (connection) {
        if(authService.isAuthenticated())
        authService.logout();
        router.navigate(['/login']);
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
