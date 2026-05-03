import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-scroll-up',
  standalone: true,
  imports: [MatIcon, MatButtonModule],
  templateUrl: './scroll-up.component.html',
  styleUrl: './scroll-up.component.scss',
})
export class ScrollUpComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document
  ) { }

  scrollToTop() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const win = this.document.defaultView;
    if (!win) {
      return;
    }
    (function smoothscroll() {
      const currentScroll =
        win.document.documentElement.scrollTop || win.document.body.scrollTop;
      if (currentScroll > 0) {
        win.requestAnimationFrame(smoothscroll);
        win.scrollTo(0, currentScroll - currentScroll / 8);
      }
    })();
  }
}
