import {Routes} from '@angular/router';
import {AuthComponent} from './auth.component';
import {LoginComponent} from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import {ResetPassword} from './components/reset-password/reset-password';
import {ForgotPassword} from './components/forgot-password/forgot-password';


export const authRoutes: Routes = [
  {
    path: "", component: AuthComponent,
    children: [
      {
        path: "login",
        component: LoginComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path : 'reset-password/:token',
        component: ResetPassword
      },
      {
        path : 'forgot-password',
        component: ForgotPassword
      }
    ]
  }
]
