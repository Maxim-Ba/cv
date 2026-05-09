import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { WorkHistoryService } from '../../services/work-history/work-history.service';
import { WorkHistoryWithTechnologiesDto } from '../../api/models/dto/work-history-with-technologies-dto';
import { TechnologyItemComponent } from '../../widgets/technology-item/technology-item.component';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';

@Component({
  selector: 'app-work-history',
  standalone: true,
  imports: [
    SectionWrapperComponent,
    TechnologyItemComponent,
    MarginsDirective,
  ],
  templateUrl: './work-history.component.html',
  styleUrl: './work-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkHistoryComponent implements OnInit {
  private workHistoryService = inject(WorkHistoryService);

  public title = 'Места работы';
  public works = signal<WorkHistoryWithTechnologiesDto[]>([]);
  public isLoading = signal(true);
  public hasError = signal(false);

  ngOnInit(): void {
    this.workHistoryService.getWorkHistory().subscribe({
      next: (data) => {
        this.works.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
