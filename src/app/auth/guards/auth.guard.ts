import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const token = localStorage.getItem('access_token');

  if (token && !tokenService.isTokenExpired()) {
    return true; // Allow navigation if token exists and is not expired
  } else {
    // Token is missing or expired, redirect to
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }
};
