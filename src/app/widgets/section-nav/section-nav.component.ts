import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';

export interface SectionNavItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-section-nav',
  standalone: true,
  imports: [MarginsDirective],
  templateUrl: './section-nav.component.html',
  styleUrl: './section-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionNavComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) items: SectionNavItem[] = [];

  readonly activeSection = signal<string>('');

  private observer?: IntersectionObserver;
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    fromEvent(window, 'scroll')
      .pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateActiveFromScroll());
  }

  ngAfterViewInit(): void {
    this.setupObserver();
    this.updateActiveFromScroll();
  }

  scrollTo(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    this.activeSection.set(sectionId);
  }

  isActive(sectionId: string): boolean {
    return this.activeSection() === sectionId;
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0 && visible[0].target.id) {
          this.activeSection.set(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    );

    for (const item of this.items) {
      const el = document.getElementById(item.id);
      if (el) {
        this.observer.observe(el);
      }
    }

    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  private updateActiveFromScroll(): void {
    if (window.scrollY < 80 && this.items.length) {
      this.activeSection.set(this.items[0].id);
    }
  }
}
