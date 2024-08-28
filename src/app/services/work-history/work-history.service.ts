import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { IWorkHistoryItem } from './types';
import { histories } from './mocks/histories.mock';

@Injectable({
  providedIn: 'root',
})
export class WorkHistoryService {
  constructor(private httpClient: HttpClient) {}
  private historyWorks: IWorkHistoryItem[] = histories;
  public getTest(): Observable<IWorkHistoryItem[]> {
    // return this.httpClient.get('https://jsonplaceholder.typicode.com/posts');
    return from(Promise.resolve(this.historyWorks));
  }
}
