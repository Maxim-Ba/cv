import { Component } from '@angular/core';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MarginsDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
