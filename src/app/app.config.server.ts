import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideTranslocoLoader } from '@jsverse/transloco';
import { appConfig } from './app.config';
import { TranslocoFsLoaderService } from './services/language/transloco-loader.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideTranslocoLoader(TranslocoFsLoaderService)],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
