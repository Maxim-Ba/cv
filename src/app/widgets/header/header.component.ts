import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContactMeComponent } from '../contact-me/contact-me.component';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { GitlabLinkComponent } from '../gitlab-link/gitlab-link.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DownloadCvService } from '../../services/download-cv/download-cv.service';
import { NavbarComponent } from '../../shared/ui-kit/navbar/navbar.component';
import { CONTACT_LINKS } from '../../shared/constants/contact-links';
import { ThemeService } from '../../services/theme/theme.service';
import { LanguageService, AppLang } from '../../services/language/language.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NavbarComponent,
    ContactMeComponent,
    MatSlideToggleModule,
    MarginsDirective,
    GitlabLinkComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  public downloadCvService = inject(DownloadCvService);
  public themeService = inject(ThemeService);
  public languageService = inject(LanguageService);

  public links = CONTACT_LINKS;
  disabled = false;

  onDarkModeSwitch(change: MatSlideToggleChange): void {
    this.themeService.setDarkMode(change.checked);
  }

  setLanguage(lang: AppLang): void {
    this.languageService.setLang(lang);
  }
}
