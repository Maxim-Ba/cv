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
import { TagDto } from '../../api/models/dto/tag-dto';

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
  @Input({ required: true }) description: string | null = null;
  @Input({ required: true }) tags: TagDto[] = [];
  @Input() logo: string | null = null;

  technologiesService = inject(TechnologiesService);
  openDialog(): void {
    this.technologiesService.onOpen(this.title, this.description, this.tags);
  }
  isOpacity: Signal<boolean> = computed(() => {
    if (!this.technologiesService.tagFilter().length) {
      return false;
    }
    const res = !this.tags.some((tag) =>
      this.technologiesService.tagFilter().includes(tag.id ?? -1)
    );
    return res;
  });
}
