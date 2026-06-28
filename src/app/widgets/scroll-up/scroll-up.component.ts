import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TechnologiesService } from '../../services/technologies/technologies.service';

@Component({
  selector: 'app-scroll-up',
  standalone: true,
  imports: [MatIcon, MatButtonModule],
  templateUrl: './scroll-up.component.html',
  styleUrl: './scroll-up.component.scss',
})
export class ScrollUpComponent {
  readonly technologiesService = inject(TechnologiesService);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document
  ) { }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    const behavior = win.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

    win.scrollTo({ top: 0, left: 0, behavior });

    const snapToTop = (): void => {
      if (win.scrollY > 0) {
        win.scrollTo(0, 0);
      }
    };

    if ('onscrollend' in win) {
      win.addEventListener('scrollend', snapToTop, { once: true });
    } else {
      window.setTimeout(snapToTop, behavior === 'smooth' ? 500 : 0);
    }
  }
}
