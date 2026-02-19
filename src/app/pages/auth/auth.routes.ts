import { Routes } from '@angular/router';
import { loginGuard } from '../../core/guards/login.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./login/login').then((c) => c.Login),
  },
];
