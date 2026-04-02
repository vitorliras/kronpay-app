import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  inject,
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
import { Chart, registerables } from 'chart.js';
import { ConfigService } from './core/services/config.service';

Chart.register(...registerables);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        languageInterceptor,
        authInterceptor,
        KeyHeaderInterceptor,
        errorInterceptor,
      ]),
    ),
    provideNgxMask(),
    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 3500,
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const config = inject(ConfigService);
        const translation = inject(TranslationService);

        return async () => {
          await config.load();

          const lang = (localStorage.getItem('lang') as 'pt-BR' | 'en-US') ?? 'pt-BR';

          translation.load(lang);
        };
      },
    },
    ...coreProviders,
  ],
};
