import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiConfiguration } from '../../api/api-configuration';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotifyMaximService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  send(data: ContactPayload): Observable<{ ok: boolean }> {
    return this.http
      .post<{ ok: boolean }>(`${this.config.rootUrl}/api/contact`, data)
      .pipe(
        retry(1),
        catchError((err) => throwError(() => err)),
      );
  }
}
