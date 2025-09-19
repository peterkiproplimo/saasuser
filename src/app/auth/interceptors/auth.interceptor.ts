import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const token = localStorage.getItem('access_token');

  // Subject to track ongoing refresh token requests
  let refreshTokenInProgress = false;
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // Add Authorization header if token exists and is not expired
  if (token && !tokenService.isTokenExpired()) {
    const tokenizedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(tokenizedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401 && !req.url.includes('login')) {
          if (req.url.includes('refresh_access_token')) {
            // If the refresh token request itself fails, sign out
            authService.sign_out();
            return throwError(() => new Error('Refresh token failed'));
          }

          if (refreshTokenInProgress) {
            // If a refresh is already in progress, wait for it to complete
            return refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(newToken =>
                next(req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                }))
              )
            );
          } else {
            // Check if refresh token is also expired
            if (tokenService.isRefreshTokenExpired()) {
              authService.sign_out();
              router.navigate(['/auth/login']);
              return throwError(() => new Error('Refresh token expired'));
            }

            // Start a new refresh token request
            refreshTokenInProgress = true;
            return authService.refreshToken().pipe(
              switchMap(response => {
                refreshTokenInProgress = false;
                refreshTokenSubject.next(response.access_token!);
                // Retry the original request with the new token
                return next(req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${response.access_token!}`)
                }));
              }),
              catchError(refreshError => {

                if (refreshError.status !== 401) {
                  return throwError(() => refreshError);
                }

                refreshTokenInProgress = false;
                refreshTokenSubject.next(null);
                authService.sign_out();
                router.navigate(['/auth/login']);
                return throwError(() => refreshError);
              })
            );
          }
        }
        // Pass through other errors
        return throwError(() => error);
      })
    );
  }

  // Pass through requests without token
  return next(req);

};
