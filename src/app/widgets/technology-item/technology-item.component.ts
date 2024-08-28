import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  Signal,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { TechnologiesService } from '../../services/technologies/technologies.service';

@Component({
  selector: 'app-technology-item',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './technology-item.component.html',
  styleUrl: './technology-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologyItemComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) desciption: string = '';
  @Input({ required: true }) tagIDs: string[] = [];
  @Input() logo: string | null = null;

  technologiesService = inject(TechnologiesService);
  openDialog(): void {
    this.technologiesService.onOpen(this.title, this.desciption, this.tagIDs);
  }
  isOpacity: Signal<boolean> = computed(() => {
    if (!this.technologiesService.tagFilter().length) {
      return false;
    }
    const res = !this.tagIDs.some((tagId) =>
      this.technologiesService.tagFilter().includes(tagId)
    );
    return res;
  });
}
