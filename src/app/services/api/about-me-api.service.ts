import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfiguration } from '../../api/api-configuration';
import { aboutMeGet } from '../../api/fn/about-me/about-me-get';
import { AboutMeDto } from '../../api/models/dto/about-me-dto';

@Injectable({
  providedIn: 'root',
})
export class AboutMeApiService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  getAboutMe(): Observable<AboutMeDto> {
    return aboutMeGet(this.http, this.config.rootUrl).pipe(
      map((r) => r.body ?? { bioParagraphs: [], technologies: [] }),
      catchError(() => EMPTY)
    );
  }
}
