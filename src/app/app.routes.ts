import { LayoutComponent } from './shared/components/layout/layout';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },

  {
    path: '',
    canActivate: [authGuard],
     loadComponent: () =>
      import('./shared/components/layout/layout').then(m => m.LayoutComponent),
    children: [
      {
        path: 'config',
        loadComponent: () =>
          import('./pages/config/config').then((m) => m.Config),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'auth',
  },
];
