import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor to add Bearer token authentication for Partner API requests
 * Only applies to requests going to the Partner API endpoints
 * Excludes login, signup, and password reset endpoints (no auth required)
 */
export const partnerAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if this is a partner API request
  const isPartnerApiRequest = req.url.includes('saas.apis.partner');
  
  // Endpoints that don't require authentication
  const publicEndpoints = [
    'partner_login',
    'partner_signup',
    'check_email',
    'forgot_password',
    'reset_password'
  ];
  
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  if (isPartnerApiRequest && !isPublicEndpoint) {
    const token = localStorage.getItem('partner_token');
    
    if (token) {
      // Clone the request and add the Authorization header
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedReq);
    }
  }
  
  // For public endpoints or non-partner API requests, proceed without modification
  return next(req);
};


