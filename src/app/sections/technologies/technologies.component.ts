import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { TechnologyItemComponent } from '../../widgets/technology-item/technology-item.component';
import { TechnologyWithTagsDto } from '../../api/models/dto/technology-with-tags-dto';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { TagFilterComponent } from './components/tag-filter/tag-filter.component';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';
import { TechApiService } from '../../services/api/tech-api.service';
import { bindLanguageReload } from '../../services/language/language-reload.util';

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
  private techApiService = inject(TechApiService);

  technologies = signal<TechnologyWithTagsDto[]>([]);
  isLoading = signal(true);
  readonly skeletonChips = Array.from({ length: 12 }, (_, index) => index);

  constructor() {
    bindLanguageReload(() => this.loadTechnologies());
  }

  private loadTechnologies(): void {
    this.isLoading.set(true);
    this.techApiService
      .getTechnologies()
      // finalize нужен для ветки без значений (ошибка гасится в сервисе).
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((techs) => {
        this.technologies.set(techs);
        // Данные из SSR приходят первыми, а следом может догружаться перевод:
        // держать скелетон до конца второго ответа незачем.
        this.isLoading.set(false);
      });
  }
}
