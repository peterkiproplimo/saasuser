import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import {authGuard} from './auth/guards/auth.guard';

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
      },
      {
        path: 'crm',
        loadChildren: () => import('./crm/routes').then(m => m.landingRoutes)
      },
      {
        path: 'about',
        loadChildren: () => import('./aboutus/routes').then(m => m.landingRoutes)
      },
       {
        path: 'our',
        loadChildren: () => import('./ourcompany/routes').then(m => m.landingRoutes)
      },
      {
        path: 'contactus',
        loadChildren: () => import('./contactus/routes').then(m => m.landingRoutes)
      },
       {
        path: 'subscriptions',
        loadChildren: () => import('./subscriptions/routes').then(m => m.landingRoutes)
      },
      {
        path: 'about',
        loadChildren: () => import('./aboutus/routes').then(m => m.landingRoutes)
      },
       {
        path: 'our',
        loadChildren: () => import('./ourcompany/routes').then(m => m.landingRoutes)
      },
      {
        path: 'contactus',
        loadChildren: () => import('./contactus/routes').then(m => m.landingRoutes)
      },
       {
        path: 'subscriptions',
        loadChildren: () => import('./subscriptions/routes').then(m => m.landingRoutes)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/routes').then(m => m.authRoutes)

  },

  {
    path: 'customer',
    loadChildren: () => import('./customer/routes').then(m => m.customerRoutes),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: '/' }
];
