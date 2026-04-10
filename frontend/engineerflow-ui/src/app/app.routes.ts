import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/requests/job-board.component').then(m => m.JobBoardComponent)
      },
      {
        path: 'requests',
        loadComponent: () => import('./features/requests/request-list/request-list.component').then(m => m.RequestListComponent)
      },
      {
        path: 'requests/new',
        loadComponent: () => import('./features/requests/request-form/request-form.component').then(m => m.RequestFormComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () => import('./features/requests/request-detail/request-detail.component').then(m => m.RequestDetailComponent)
      },
      {
        path: 'requests/:id/edit',
        loadComponent: () => import('./features/requests/request-form/request-form.component').then(m => m.RequestFormComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/audit/audit-trail.component').then(m => m.AuditTrailComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/error/not-found.component').then(m => m.NotFoundComponent)
  }
];
