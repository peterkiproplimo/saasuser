import {Routes} from '@angular/router';
import {Customer} from './customer';
import {Profile} from './pages/profile/profile';
import {Dashboard} from './pages/dashboard/dashboard';
import {Invoices} from './pages/invoices/invoices';
import {BillingHistory} from './pages/billing-history/billing-history';
import {SubscriptionsComponent} from '../subscriptions/subscriptions';
import {Subscribe} from './pages/subscribe/subscribe';
import {SolutionDetail} from './pages/subscribe/components/solution-detail/solution-detail';
import {Cart} from './pages/cart/cart';
import {Checkout} from './pages/checkout/checkout';
import {Tickets} from './pages/tickets/tickets';
import {TicketDetail} from './pages/tickets/components/ticket-detail/ticket-detail';
import {ThankYou} from './pages/thank-you/thank-you';

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
      },

      {
        path: "solution/:id",
        component: SolutionDetail
      },

      {
        path: "cart",
        component: Cart
      },

      {
        path: "tickets",
        component: Tickets
      },

      {
        path : "tickets/:id",
        component: TicketDetail
      },

      {
        path: "checkout",
        component: Checkout
      },

      {
        path: "thank-you",
        component: ThankYou
      }

      ]
  }

]
