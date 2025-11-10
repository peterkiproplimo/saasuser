import { Routes } from '@angular/router';
import { PartnerComponent } from './partner.component';
import { PartnerDashboardComponent } from './pages/dashboard/partner-dashboard.component';
import { ProductListComponent } from './pages/products/product-list.component';
import { ProductFormComponent } from './pages/products/product-form.component';
import { PartnerInsightsComponent } from './pages/insights/partner-insights.component';
import { PartnerClientsComponent } from './pages/clients/partner-clients.component';
import { PartnerAuthComponent } from './components/auth/partner-auth.component';
import { PartnerSignupComponent } from './components/signup/partner-signup.component';
import { PartnerLoginComponent } from './components/login/partner-login.component';
import { PartnerForgotPasswordComponent } from './components/forgot-password/partner-forgot-password.component';
import { partnerAuthGuard } from './guards/partner-auth.guard';

export const partnerRoutes: Routes = [
  // Auth routes (no guard) - specific paths first to avoid conflicts
  {
    path: 'signup',
    component: PartnerAuthComponent,
    children: [
      {
        path: '',
        component: PartnerSignupComponent
      }
    ]
  },
  {
    path: 'login',
    component: PartnerAuthComponent,
    children: [
      {
        path: '',
        component: PartnerLoginComponent
      }
    ]
  },
  {
    path: 'forgot-password',
    component: PartnerAuthComponent,
    children: [
      {
        path: '',
        component: PartnerForgotPasswordComponent
      }
    ]
  },
  // Protected partner routes - must come after auth routes
  {
    path: '',
    component: PartnerComponent,
    canActivate: [partnerAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: PartnerDashboardComponent
      },
      {
        path: 'products',
        component: ProductListComponent
      },
      {
        path: 'products/create',
        component: ProductFormComponent
      },
      {
        path: 'products/edit/:id',
        component: ProductFormComponent
      },
      {
        path: 'insights',
        component: PartnerInsightsComponent
      },
      {
        path: 'clients',
        component: PartnerClientsComponent
      }
    ]
  }
];

