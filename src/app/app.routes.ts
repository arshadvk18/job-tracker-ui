import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'analyze',
    loadComponent: () => import('./pages/analyze/analyze.component').then(m => m.AnalyzeComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];