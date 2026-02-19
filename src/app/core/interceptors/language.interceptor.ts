import { HttpInterceptorFn } from "@angular/common/http";

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const language = localStorage.getItem('lang') ?? 'pt-BR';

  const cloned = req.clone({
    setHeaders: {
      'Accept-Language': language
    }
  });

  return next(cloned);
};
