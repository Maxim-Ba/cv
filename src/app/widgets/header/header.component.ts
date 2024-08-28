import { Component, EventEmitter, inject, Output } from '@angular/core';
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
import { ApplicationStabService } from '../../services/application-stab/application-stab.service';
import { NavbarComponent } from '../../shared/ui-kit/navbar/navbar.component';

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
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Output()
  readonly isModeSwitched = new EventEmitter<boolean>();
  public stabService = inject(ApplicationStabService);

  public links = {
    telegram: { href: 'https://t.me/BalashovMaximm', label: 'T' },
    whatsapp: { href: 'https://wa.me/89164211428', label: 'W' },
    // email: { href: 'info@maxim-ba.ru', label: 'info@maxim-ba.ru' },
    email: { href: '79164211428@yandex.ru', label: '79164211428@yandex.ru' },
    downloadCV: { href: 'https://api.maxim-ba.ru/download-cv', label: 'img' },
  } as const;
  checked = false;
  disabled = false;
  onDarkModeSwitch(change: MatSlideToggleChange) {
    this.isModeSwitched.emit(change.checked);
  }
}
