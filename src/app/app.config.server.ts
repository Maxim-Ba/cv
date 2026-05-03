import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { withInterceptors, provideHttpClient } from '@angular/common/http';
import { appConfig } from './app.config';
import { ssrBaseUrlInterceptor } from './interceptors/ssr-base-url.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(withInterceptors([ssrBaseUrlInterceptor])),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
