import {Routes} from '@angular/router';
import {Customer} from './customer';
import {Profile} from './pages/profile/profile';
import {Dashboard} from './pages/dashboard/dashboard';
import {Invoices} from './pages/invoices/invoices';
import {BillingHistory} from './pages/billing-history/billing-history';
import {SubscriptionsComponent} from '../subscriptions/subscriptions';
import {Subscribe} from './pages/subscribe/subscribe';

export const customerRoutes: Routes = [

  {path: "", component: Customer,

    children: [
      {
        path: "",
        component: Dashboard
      },
      {
        path: "profile",
        component: Profile,
      },
      {
        path: "invoices",
        component: Invoices
      },
      {
        path: "billing",
        component: BillingHistory
      },
      {
        path: "subscriptions",
        component: SubscriptionsComponent
      },

      {
        path: "subscribe",
        component: Subscribe
      }
      ]
  }

]
