import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TAGS } from '../../../../shared/constants/tags';
import { TagComponent } from '../tag/tag.component';
import { ITag } from '../../../../shared/types/types';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-tag-filter',
  standalone: true,
  imports: [TagComponent, MatChipsModule],
  templateUrl: './tag-filter.component.html',
  styleUrl: './tag-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFilterComponent {
  tags: [string, ITag][] = Object.entries(TAGS);
}
