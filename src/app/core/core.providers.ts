import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const coreProviders: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useValue: authInterceptor,
    multi: true
  }
];
