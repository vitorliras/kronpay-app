import { HttpInterceptorFn } from "@angular/common/http";
import { ConfigService } from "../services/config.service";
import { inject } from "@angular/core";

export const KeyHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const settings = inject(ConfigService);

  if (!settings.isApiUrl(req.url)) {
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      ...settings.config.headers,
    },
  });

  return next(clonedRequest);
};
