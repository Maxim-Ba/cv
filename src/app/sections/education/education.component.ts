import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';
import { EduApiService } from '../../services/api/edu-api.service';
import { EducationDto } from '../../api/models/dto/education-dto';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [SectionWrapperComponent, MarginsDirective],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent implements OnInit {
  private eduApiService = inject(EduApiService);

  public title = 'Образование';
  public education = signal<EducationDto[]>([]);

  ngOnInit(): void {
    this.eduApiService.getEducation().subscribe((items) => {
      this.education.set(items);
    });
  }
}
