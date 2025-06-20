import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        loadChildren: () => import('./layout/routes').then(m => m.layoutRoutes)
      },
      {
        path: 'auth',
        loadChildren: () => import('./auth/routes').then(m => m.authRoutes)
      },
      {
        path: 'hrm',
        loadChildren: () => import('./hrm/routes').then(m => m.landingRoutes)
      },
      {
        path: 'pos',
        loadChildren: () => import('./pos/routes').then(m => m.landingRoutes)
      },
      {
        path: 'erp',
        loadChildren: () => import('./erp/routes').then(m => m.landingRoutes)
      },
      {
        path: 'bpo',
        loadChildren: () => import('./bpo/routes').then(m => m.landingRoutes)
      }
    ]
  },
  { path: '**', redirectTo: '/' }
];
