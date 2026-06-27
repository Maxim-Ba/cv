import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStabService {
  stream = new Subject<{ message: string }>();

  private lastMessage = '';
  private lastNotifiedAt = 0;

  emitInProcessMessage() {
    this.stream.next({ message: 'Функционал в разработке' });
  }

  notify(message: string) {
    const now = Date.now();

    if (message === this.lastMessage && now - this.lastNotifiedAt < 3000) {
      return;
    }

    this.lastMessage = message;
    this.lastNotifiedAt = now;
    this.stream.next({ message });
  }
}
