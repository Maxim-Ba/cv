import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfiguration } from '../../api/api-configuration';

export interface HeroDto {
  greeting: string;
  fullName: string;
  title: string;
  pitch: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeroApiService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  getHero(): Observable<HeroDto> {
    return this.http.get<HeroDto>(`${this.config.rootUrl}/hero`);
  }
}
