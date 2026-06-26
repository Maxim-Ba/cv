import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
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
import { ApplicationStabService } from '../../services/application-stab/application-stab.service';
import { DownloadCvService } from '../../services/download-cv/download-cv.service';
import { NavbarComponent } from '../../shared/ui-kit/navbar/navbar.component';
import { CONTACT_LINKS } from '../../shared/constants/contact-links';

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
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Output()
  readonly isModeSwitched = new EventEmitter<boolean>();
  public stabService = inject(ApplicationStabService);
  public downloadCvService = inject(DownloadCvService);

  public links = CONTACT_LINKS;
  checked = false;
  disabled = false;
  onDarkModeSwitch(change: MatSlideToggleChange) {
    this.isModeSwitched.emit(change.checked);
  }
}
