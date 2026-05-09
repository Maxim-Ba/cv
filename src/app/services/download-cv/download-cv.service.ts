import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, catchError, finalize } from 'rxjs';
import { ApiConfiguration } from '../../api/api-configuration';
import { ApplicationStabService } from '../application-stab/application-stab.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadCvService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);
  private notify = inject(ApplicationStabService);

  readonly isDownloading = signal(false);

  downloadCV(): void {
    if (this.isDownloading()) return;
    this.isDownloading.set(true);

    this.http
      .get(`${this.config.rootUrl}/download-cv`, { responseType: 'blob' })
      .pipe(
        catchError(() => {
          this.notify.notify('Не удалось скачать PDF');
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
        this.notify.notify('CV успешно скачан');
      });
  }
}
