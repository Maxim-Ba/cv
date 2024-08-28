import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TechnologyItemComponent } from '../../widgets/technology-item/technology-item.component';
import { TECHNOLOGIES } from '../../shared/constants/technologies';
import { ITechnologyItem } from '../../shared/types/types';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { TagFilterComponent } from './components/tag-filter/tag-filter.component';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [
    MarginsDirective,
    TechnologyItemComponent,
    SectionWrapperComponent,
    TagFilterComponent,
  ],
  templateUrl: './technologies.component.html',
  styleUrl: './technologies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologiesComponent {
  public title = 'Используемые технологии';

  tags: string[] = [];
  technologies: ITechnologyItem[] = Object.values(TECHNOLOGIES);
}
