import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { GitlabLinkComponent } from '../../widgets/gitlab-link/gitlab-link.component';
import { ContactMeComponent } from '../../widgets/contact-me/contact-me.component';
import { DownloadCvService } from '../../services/download-cv/download-cv.service';
import { HeroApiService, HeroDto } from '../../services/api/hero-api.service';
import { CONTACT_LINKS } from '../../shared/constants/contact-links';
import { bindLanguageReload } from '../../services/language/language-reload.util';

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
    TranslocoModule,
  ],
  templateUrl: './main-info.component.html',
  styleUrl: './main-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainInfoComponent {
  readonly links = CONTACT_LINKS;
  readonly downloadCvService = inject(DownloadCvService);
  private heroApiService = inject(HeroApiService);

  hero = signal<HeroDto | null>(null);

  constructor() {
    bindLanguageReload(() => this.loadHero());
  }

  private loadHero(): void {
    this.heroApiService.getHero().subscribe((data) => this.hero.set(data));
  }
}
