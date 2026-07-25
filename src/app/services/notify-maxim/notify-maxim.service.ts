import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, take } from 'rxjs/operators';
import { ApiConfiguration } from '../../api/api-configuration';
import { SKIP_HTTP_ERROR_NOTIFY } from '../../interceptors/http-context';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotifyMaximService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isAvailable = signal(false);

  private availabilityChecked = false;

  send(data: ContactPayload): Observable<{ ok: boolean }> {
    return this.http
      .post<{ ok: boolean }>(`${this.config.rootUrl}/contact`, data)
      .pipe(
        retry(1),
        catchError((err) => throwError(() => err)),
      );
  }

  checkAvailability(): void {
    if (this.availabilityChecked || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.availabilityChecked = true;

    this.http
      .get(`${this.config.rootUrl}/contact`, {
        observe: 'response',
        context: new HttpContext().set(SKIP_HTTP_ERROR_NOTIFY, true),
      })
      .pipe(
        map((response) => this.isContactMeAvailable(response.status)),
        catchError((error: HttpErrorResponse) =>
          of(this.isContactMeAvailable(error.status)),
        ),
        take(1),
      )
      .subscribe((available) => this.isAvailable.set(available));
  }

  private isContactMeAvailable(status: number): boolean {
    if (status >= 200 && status < 300) {
      return true;
    }

    // POST-only endpoint responds with 405 when contact-me service is reachable.
    return status === 405;
  }
}
