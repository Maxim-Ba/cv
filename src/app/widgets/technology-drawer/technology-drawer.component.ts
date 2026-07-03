import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { TechnologiesService } from '../../services/technologies/technologies.service';

@Component({
  selector: 'app-technology-drawer',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './technology-drawer.component.html',
  styleUrl: './technology-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologyDrawerComponent {
  technologiesService = inject(TechnologiesService);

  close(): void {
    this.technologiesService.onClose();
  }
}
