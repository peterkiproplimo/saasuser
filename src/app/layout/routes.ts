import {Routes} from '@angular/router';

export const layoutRoutes: Routes = [

  {
    path: "",
    loadChildren: () => import('../landing/routes').then(m => m.landingRoutes)
  },

]
