import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { WorkHistoryService } from '../../services/work-history/work-history.service';
import { WorkHistoryWithTechnologiesDto } from '../../api/models/dto/work-history-with-technologies-dto';
import { TechnologyItemComponent } from '../../widgets/technology-item/technology-item.component';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';
import { formatIsoDateToMonthYear } from '../../utils/format-iso-date';
import { bindLanguageReload } from '../../services/language/language-reload.util';

@Component({
  selector: 'app-work-history',
  standalone: true,
  imports: [
    SectionWrapperComponent,
    TechnologyItemComponent,
    MarginsDirective,
    TranslocoModule,
  ],
  templateUrl: './work-history.component.html',
  styleUrl: './work-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkHistoryComponent {
  private workHistoryService = inject(WorkHistoryService);
  private transloco = inject(TranslocoService);

  public works = signal<WorkHistoryWithTechnologiesDto[]>([]);
  public isLoading = signal(true);
  public hasError = signal(false);

  constructor() {
    bindLanguageReload(() => this.loadWorks());
  }

  private loadWorks(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
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

  protected formatPeriodStart(date?: string): string {
    return formatIsoDateToMonthYear(date, this.transloco.getActiveLang()) ?? '?';
  }

  protected formatPeriodEnd(date?: string): string {
    return (
      formatIsoDateToMonthYear(date, this.transloco.getActiveLang()) ??
      this.transloco.translate('workHistory.presentLabel')
    );
  }
}
