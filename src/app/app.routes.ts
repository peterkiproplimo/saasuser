import { Routes } from '@angular/router';
import {Layout} from './layout/layout';

export const routes: Routes = [

  {
    path : "",
    component: Layout,
    children: [
      {
        path: "",
        loadChildren: () => import('./layout/routes').then(m => m.layoutRoutes)
      },
    ]
  },

  {
    path : "auth",
    loadChildren: () => import('./auth/routes').then(m => m.authRoutes)
  },

  { path: '**', redirectTo: '/' }

];
