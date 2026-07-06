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
          import('./pages/config/config').then((m) => m.ConfigComponent),

      },
      {
        path: 'transaction',
        loadComponent: () =>
          import('./pages/transaction/transaction').then((m) => m.TransactionComponente),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponente),
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./pages/report/report').then((m) => m.ReportComponent),
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./pages/planning/planning').then((m) => m.PlanningComponent),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./pages/goals/goals').then((m) => m.Goals),
      },
      {
        path: 'goals-history',
        loadComponent: () =>
          import('./pages/goals-history/goals-history').then((m) => m.GoalsHistory),
      },
      {
        path: 'connector',
        loadComponent: () =>
          import('./pages/connector/connector').then((m) => m.ConnectorComponent),
      },
      {
        path: 'credit-card',
        redirectTo: 'credit-card/cards',
        pathMatch: 'full',
      },
      {
        path: 'credit-card/cards',
        loadComponent: () =>
          import('./pages/credit-card/credit-card').then((m) => m.CreditCardComponent),
      },
      {
        path: 'credit-card/invoices',
        loadComponent: () =>
          import('./pages/credit-card/card-invoices/card-invoices').then(
            (m) => m.CardInvoicesComponent,
          ),
      }
    ],
  },

  {
    path: '**',
    redirectTo: 'auth',
  },
];
