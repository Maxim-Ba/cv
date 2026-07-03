import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language/language.service';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = inject(LanguageService).currentLang();
  if (req.url.includes('/api') || req.url.includes('/download-cv')) {
    return next(
      req.clone({
        setHeaders: {
          'Accept-Language': lang,
        },
      }),
    );
  }
  return next(req);
};
