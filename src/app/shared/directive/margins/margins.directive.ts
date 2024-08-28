import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appMargins]',
  standalone: true,
})
export class MarginsDirective {
  constructor() {}
  @Input() marginPX: number | null = null;
  @HostBinding('style.margin-left') marginL: string = this.marginPX
    ? `${this.marginPX}px`
    : '';
  @HostBinding('style.margin-right') marginR: string = this.marginPX
    ? `${this.marginPX}px`
    : '';
  @HostBinding('style.display')
  @Input()
  display: HTMLElement['style']['display'] = 'block';
  @HostBinding('class.with-margin') class = !this.marginPX;
}
