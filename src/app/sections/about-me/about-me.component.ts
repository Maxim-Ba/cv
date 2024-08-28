import { Component } from '@angular/core';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [SectionWrapperComponent, MarginsDirective],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss',
})
export class AboutMeComponent {
  public title = 'О себе';
}
