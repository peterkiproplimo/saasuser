import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); // Inject the Router service
  const token = localStorage.getItem('access_token'); // Check for access_token

  if (token) {
    return true; // Allow navigation if token exists
  } else {
    // Redirect to login page and store the attempted URL for redirection after login
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }
};
