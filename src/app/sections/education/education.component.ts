import { Component } from '@angular/core';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { EDUCATION } from '../../shared/constants/education';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [SectionWrapperComponent, MarginsDirective],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
})
export class EducationComponent {
  public title = 'Образование';
  public education = EDUCATION;
}
