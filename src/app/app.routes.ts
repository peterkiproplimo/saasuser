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
        loadChildren: () => import('./oursolutions/routes').then(m => m.landingRoutes)
      },
      {
        path: 'pos',
        loadChildren: () => import('./pos/routes').then(m => m.landingRoutes)
      },
     {
  path: 'solutions/:id',
  loadComponent: () => import('./oursolutions/oursolutions').then(m => m.OursolutionsComponent)
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
      },
      {
        path: 'faqs',
        loadChildren: () => import('./faq/routes').then(m => m.faqRoutes)
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
