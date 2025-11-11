import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import {DatePipe} from '@angular/common';
import { partnerAuthInterceptor } from './partner/interceptors/partner-auth.interceptor';
// Mock interceptor removed - now using real API
// import { partnerApiInterceptor } from './partner/mocks/partner-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    DatePipe,
    provideHttpClient(withInterceptors([
      partnerAuthInterceptor, // Add Bearer token for partner API requests
      authInterceptor // Keep existing auth interceptor for customer/auth endpoints
    ])),

    provideAnimationsAsync(),
    providePrimeNG({
    theme: {
        preset: Aura,
      options: {
        darkModeSelector: '.dark'
      }

      }
    })

  ]
};
