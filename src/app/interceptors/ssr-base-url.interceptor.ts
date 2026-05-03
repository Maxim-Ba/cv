import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const ssrBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId) && req.url.startsWith('/api')) {
    const backendUrl = process.env['BACKEND_URL'] ?? 'http://localhost:3333';
    const cloned = req.clone({ url: `${backendUrl}${req.url}` });
    return next(cloned);
  }

  return next(req);
};
