import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-gitlab-link',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './gitlab-link.component.html',
  styleUrl: './gitlab-link.component.scss',
})
export class GitlabLinkComponent {}
