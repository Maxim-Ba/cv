import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApplicationStabService } from '../services/application-stab/application-stab.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifyService = inject(ApplicationStabService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Произошла ошибка';

      if (error.status === 0) {
        message = 'Нет соединения с сервером';
      } else if (error.status >= 500) {
        message = 'Ошибка сервера. Попробуйте позже.';
      } else if (error.status === 404) {
        message = 'Ресурс не найден';
      } else if (error.status === 403) {
        message = 'Доступ запрещён';
      }

      notifyService.notify(message);
      return throwError(() => error);
    })
  );
};
