import { Component } from '@angular/core';
import { GitlabLinkComponent } from '../gitlab-link/gitlab-link.component';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [GitlabLinkComponent, MarginsDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}
