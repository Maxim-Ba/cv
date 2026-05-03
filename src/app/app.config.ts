import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideApiConfiguration } from './api/api-configuration';
import { environment } from '../environments/environment';
import { ssrBaseUrlInterceptor } from './interceptors/ssr-base-url.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([ssrBaseUrlInterceptor])),
    provideAnimationsAsync(),
    provideApiConfiguration(`${environment.apiUrl}/api`),
  ],
};
