import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStabService {
  stream = new Subject<{ message: string }>();

  emitInProcessMessage() {
    this.stream.next({ message: 'Функционал в разработке' });
  }
}
