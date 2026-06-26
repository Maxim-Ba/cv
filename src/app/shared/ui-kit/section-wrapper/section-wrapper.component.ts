import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CvRevealDirective } from '../../directive/reveal/cv-reveal.directive';
import { MarginsDirective } from '../../directive/margins/margins.directive';

@Component({
  selector: 'app-section-wrapper',
  standalone: true,
  imports: [CvRevealDirective, MarginsDirective],
  templateUrl: './section-wrapper.component.html',
  styleUrl: './section-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionWrapperComponent {
  @Input({ required: true }) sectionId!: string;
  @Input() sectionTitle = '';
  @Input() isHero = false;
}
