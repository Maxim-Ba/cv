import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MarginsDirective, TranslocoModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
