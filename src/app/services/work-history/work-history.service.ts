import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IWorkHistoryItem } from './types';
import { histories } from './mocks/histories.mock';

@Injectable({
  providedIn: 'root',
})
export class WorkHistoryService {
  private historyWorks: IWorkHistoryItem[] = histories;
  public getWorkHistory(): Observable<IWorkHistoryItem[]> {
    return of(this.historyWorks);
  }
}
