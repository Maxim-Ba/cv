import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfiguration } from '../../api/api-configuration';
import { eduGet } from '../../api/fn/education/edu-get';
import { EducationDto } from '../../api/models/dto/education-dto';

@Injectable({
  providedIn: 'root',
})
export class EduApiService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  getEducation(): Observable<EducationDto[]> {
    return eduGet(this.http, this.config.rootUrl).pipe(
      map((r) => r.body.content ?? [])
    );
  }
}
