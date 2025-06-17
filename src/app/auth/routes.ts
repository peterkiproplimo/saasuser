import {Routes} from '@angular/router';
import {AuthComponent} from './auth.component';
import {LoginComponent} from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';


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
      }
    ]
  }
]
