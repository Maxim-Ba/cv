import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';
import { AboutMeApiService } from '../../services/api/about-me-api.service';
import { TechnologyWithTagsDto } from '../../api/models/dto/technology-with-tags-dto';
import { bindLanguageReload } from '../../services/language/language-reload.util';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [SectionWrapperComponent, MarginsDirective],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMeComponent {
  private aboutMeApiService = inject(AboutMeApiService);

  bioParagraphs = signal<string[]>([]);
  technologies = signal<TechnologyWithTagsDto[]>([]);
  note = signal<string | null>(null);
  hobbies = signal<string | null>(null);
  isLoading = signal(true);
  readonly skeletonLines = [1, 2, 3, 4];

  constructor() {
    bindLanguageReload(() => this.loadAboutMe());
  }

  private loadAboutMe(): void {
    this.isLoading.set(true);
    this.aboutMeApiService
      .getAboutMe()
      // finalize нужен для ветки без значений (ошибка гасится в сервисе).
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((data) => {
        this.bioParagraphs.set(data.bioParagraphs ?? []);
        this.technologies.set(data.technologies ?? []);
        this.note.set(data.note ?? null);
        this.hobbies.set(data.hobbies ?? null);
        // Данные из SSR приходят первыми, а следом может догружаться перевод:
        // держать скелетон до конца второго ответа незачем.
        this.isLoading.set(false);
      });
  }
}
