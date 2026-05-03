import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return techGet(this.http, this.config.rootUrl).pipe(
      map((r) => r.body.content ?? [])
    );
  }
}
