import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TechnologyItemComponent } from '../../widgets/technology-item/technology-item.component';
import { TechnologyWithTagsDto } from '../../api/models/dto/technology-with-tags-dto';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { TagFilterComponent } from './components/tag-filter/tag-filter.component';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';
import { TechApiService } from '../../services/api/tech-api.service';

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
export class TechnologiesComponent implements OnInit {
  private techApiService = inject(TechApiService);

  public title = 'Используемые технологии';
  technologies = signal<TechnologyWithTagsDto[]>([]);

  ngOnInit(): void {
    this.techApiService.getTechnologies().subscribe((techs) => {
      this.technologies.set(techs);
    });
  }
}
