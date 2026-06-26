import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GitlabLinkComponent } from '../../widgets/gitlab-link/gitlab-link.component';
import { ContactMeComponent } from '../../widgets/contact-me/contact-me.component';
import { DownloadCvService } from '../../services/download-cv/download-cv.service';
import { CONTACT_LINKS } from '../../shared/constants/contact-links';

@Component({
  selector: 'app-main-info',
  standalone: true,
  imports: [
    GitlabLinkComponent,
    ContactMeComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './main-info.component.html',
  styleUrl: './main-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainInfoComponent {
  readonly links = CONTACT_LINKS;
  readonly downloadCvService = inject(DownloadCvService);
}
