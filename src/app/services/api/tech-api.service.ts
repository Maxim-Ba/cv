import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfiguration } from '../../api/api-configuration';
import { techGet } from '../../api/fn/technologies/tech-get';
import { TechnologyWithTagsDto } from '../../api/models/dto/technology-with-tags-dto';

@Injectable({
  providedIn: 'root',
})
export class TechApiService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  getTechnologies(): Observable<TechnologyWithTagsDto[]> {
    return techGet(this.http, this.config.rootUrl, { size: 0 }).pipe(
      map((r) => r.body?.content ?? []),
      catchError(() => EMPTY)
    );
  }
}
