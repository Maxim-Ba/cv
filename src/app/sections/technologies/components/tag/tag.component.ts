import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  Signal,
} from '@angular/core';
import { TechnologiesService } from '../../../../services/technologies/technologies.service';
import { MatChipsModule } from '@angular/material/chips';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [MatChipsModule, NgStyle, NgIf],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) tagLabel!: string;
  @Input({ required: true }) color!: string;

  filter = inject(TechnologiesService);

  selected: Signal<boolean> = computed(() =>
    this.filter.tagFilter().includes(this.id)
  );
  onSelect() {
    this.filter.filter(this.id);
  }
}
