import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-section-wrapper',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './section-wrapper.component.html',
  styleUrl: './section-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionWrapperComponent {
  // readonly panelOpenState = signal(false);
  @Input({ required: true }) sectionTitle!: string;
}
