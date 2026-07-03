import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, catchError, finalize } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { ApiConfiguration } from '../../api/api-configuration';
import { ApplicationStabService } from '../application-stab/application-stab.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadCvService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);
  private notify = inject(ApplicationStabService);
  private transloco = inject(TranslocoService);

  readonly isDownloading = signal(false);

  downloadCV(): void {
    if (this.isDownloading()) return;
    this.isDownloading.set(true);

    this.http
      .get(`${this.config.rootUrl}/download-cv`, { responseType: 'blob' })
      .pipe(
        catchError(() => {
          this.notify.notify(this.transloco.translate('notifications.downloadFailed'));
          return EMPTY;
        }),
        finalize(() => this.isDownloading.set(false)),
      )
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'CV_Balashov_Maxim.pdf';
        anchor.click();
        URL.revokeObjectURL(url);
        this.notify.notify(this.transloco.translate('notifications.downloadSuccess'));
      });
  }
}
