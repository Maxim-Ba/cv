import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { ApplicationStabService } from '../services/application-stab/application-stab.service';
import { SKIP_HTTP_ERROR_NOTIFY } from './http-context';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifyService = inject(ApplicationStabService);
  const transloco = inject(TranslocoService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.context.get(SKIP_HTTP_ERROR_NOTIFY)) {
        return throwError(() => error);
      }

      let message = transloco.translate('errors.generic');

      if (error.status === 0) {
        message = transloco.translate('errors.noConnection');
      } else if (error.status >= 500) {
        message = transloco.translate('errors.server');
      } else if (error.status === 404) {
        message = transloco.translate('errors.notFound');
      } else if (error.status === 403) {
        message = transloco.translate('errors.forbidden');
      }

      notifyService.notify(message);
      return throwError(() => error);
    }),
  );
};
