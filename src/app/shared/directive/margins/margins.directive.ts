import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appMargins]',
  standalone: true,
})
export class MarginsDirective {
  @Input() marginPX: number | null = null;
  @HostBinding('style.margin-left') get marginL(): string {
    return this.marginPX ? `${this.marginPX}px` : '';
  }
  @HostBinding('style.margin-right') get marginR(): string {
    return this.marginPX ? `${this.marginPX}px` : '';
  }
  @HostBinding('style.display')
  @Input()
  display: HTMLElement['style']['display'] = 'block';
  @HostBinding('class.with-margin') get withMarginClass(): boolean {
    return !this.marginPX;
  }
}
