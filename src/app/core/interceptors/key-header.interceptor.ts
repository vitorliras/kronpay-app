import { HttpInterceptorFn } from '@angular/common/http';

export const KeyHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedRequest = req.clone({
    setHeaders: {
      'X-Access-Key': 'FSDF4523GKIOP13Y642F526109A'
    }
  });

  return next(clonedRequest);
};
