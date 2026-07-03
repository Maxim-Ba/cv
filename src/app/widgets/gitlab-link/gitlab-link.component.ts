import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-gitlab-link',
  standalone: true,
  imports: [MatTooltipModule, TranslocoModule],
  templateUrl: './gitlab-link.component.html',
  styleUrl: './gitlab-link.component.scss',
})
export class GitlabLinkComponent {}
