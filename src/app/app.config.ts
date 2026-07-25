import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco } from '@jsverse/transloco';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideApiConfiguration } from './api/api-configuration';
import { environment } from '../environments/environment';
import { apiTransferStateInterceptor } from './interceptors/api-transfer-state.interceptor';
import { ssrBaseUrlInterceptor } from './interceptors/ssr-base-url.interceptor';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';
import { languageInterceptor } from './interceptors/language.interceptor';
import { LanguageService } from './services/language/language.service';
import { TranslocoHttpLoaderService } from './services/language/transloco-loader.service';

function initLanguage(): () => Promise<void> {
  const languageService = inject(LanguageService);
  return () => languageService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(
      // `/api` переносится через apiTransferStateInterceptor: встроенный кеш
      // не умеет сопоставлять относительный URL браузера с абсолютным URL SSR.
      // Для `/assets/i18n/*.json` штатный механизм работает и остаётся включённым.
      withHttpTransferCacheOptions({ filter: (req) => !req.url.includes('/api') }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        apiTransferStateInterceptor,
        ssrBaseUrlInterceptor,
        languageInterceptor,
        httpErrorInterceptor,
      ]),
    ),
    provideAnimationsAsync(),
    provideApiConfiguration(`${environment.apiUrl}/api`),
    provideTransloco({
      config: {
        availableLangs: ['ru', 'en'],
        defaultLang: 'ru',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoaderService,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initLanguage,
      multi: true,
    },
  ],
};
