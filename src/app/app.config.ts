import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import {DatePipe} from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    DatePipe,
    provideHttpClient(withInterceptors([
      authInterceptor
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
