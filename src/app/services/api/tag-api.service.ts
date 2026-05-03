import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfiguration } from '../../api/api-configuration';
import { tagGet } from '../../api/fn/tags/tag-get';
import { TagDto } from '../../api/models/dto/tag-dto';

@Injectable({
  providedIn: 'root',
})
export class TagApiService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  getTags(): Observable<TagDto[]> {
    return tagGet(this.http, this.config.rootUrl).pipe(
      map((r) => r.body.content ?? [])
    );
  }
}
