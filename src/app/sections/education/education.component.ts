import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';
import { EduApiService } from '../../services/api/edu-api.service';
import { EducationDto } from '../../api/models/dto/education-dto';
import { bindLanguageReload } from '../../services/language/language-reload.util';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [SectionWrapperComponent, MarginsDirective, TranslocoModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent {
  private eduApiService = inject(EduApiService);

  public education = signal<EducationDto[]>([]);

  constructor() {
    bindLanguageReload(() => this.loadEducation());
  }

  private loadEducation(): void {
    this.eduApiService.getEducation().subscribe((items) => {
      this.education.set(items);
    });
  }
}
