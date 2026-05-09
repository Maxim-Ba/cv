import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfiguration } from '../../api/api-configuration';
import { whGet } from '../../api/fn/work-history/wh-get';
import { WorkHistoryWithTechnologiesDto } from '../../api/models/dto/work-history-with-technologies-dto';

@Injectable({
  providedIn: 'root',
})
export class WorkHistoryService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  public getWorkHistory(): Observable<WorkHistoryWithTechnologiesDto[]> {
    return whGet(this.http, this.config.rootUrl).pipe(
      map((r) => r.body?.content ?? []),
      catchError(() => EMPTY)
    );
  }
}
