import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  inject
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { coreProviders } from './core/core.providers';
import { provideNgxMask } from 'ngx-mask';

import { languageInterceptor } from './core/interceptors/language.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { KeyHeaderInterceptor } from './core/interceptors/key-header.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { TranslationService } from './core/services/translation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        languageInterceptor,
        authInterceptor,
        KeyHeaderInterceptor,
        errorInterceptor
      ])
    ),
    provideNgxMask(),
    provideAnimations(),

    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 3500,
      preventDuplicates: true,
      closeButton: true,
      progressBar: true
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const translation = inject(TranslationService);
        return () => {
          const lang =
            (localStorage.getItem('lang') as 'pt-BR' | 'en-US') ?? 'pt-BR';

          return translation.load(lang);
        };
      }
    },

    ...coreProviders
  ]
};
