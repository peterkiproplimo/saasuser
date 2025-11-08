import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PartnerAuthService } from '../services/partner-auth.service';

export const partnerAuthGuard: CanActivateFn = (route, state) => {
  const partnerAuth = inject(PartnerAuthService);
  const router = inject(Router);

  // This guard only protects dashboard/product routes, not signup/login
  // Signup/login routes are defined separately without this guard
  if (partnerAuth.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/partner/login']);
    return false;
  }
};

