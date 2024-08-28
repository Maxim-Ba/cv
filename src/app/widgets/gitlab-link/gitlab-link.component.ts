import { Component, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationStabService } from '../../services/application-stab/application-stab.service';

@Component({
  selector: 'app-gitlab-link',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './gitlab-link.component.html',
  styleUrl: './gitlab-link.component.scss',
})
export class GitlabLinkComponent {
  public stabService = inject(ApplicationStabService);
}
