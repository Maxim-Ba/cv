import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appCvReveal]',
  standalone: true,
})
export class CvRevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;
    element.classList.add('cv-reveal');

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
