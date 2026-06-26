import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCvReveal]',
  standalone: true,
})
export class CvRevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;
    element.classList.add('cv-reveal');

    if (
      !isPlatformBrowser(this.platformId) ||
      typeof IntersectionObserver === 'undefined'
    ) {
      element.classList.add('cv-reveal--visible');
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('cv-reveal--visible');
          this.observer?.unobserve(element);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
