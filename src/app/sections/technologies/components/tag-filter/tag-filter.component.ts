import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TagComponent } from '../tag/tag.component';
import { TagDto } from '../../../../api/models/dto/tag-dto';
import { MatChipsModule } from '@angular/material/chips';
import { TagApiService } from '../../../../services/api/tag-api.service';

@Component({
  selector: 'app-tag-filter',
  standalone: true,
  imports: [TagComponent, MatChipsModule],
  templateUrl: './tag-filter.component.html',
  styleUrl: './tag-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFilterComponent implements OnInit {
  private tagApiService = inject(TagApiService);
  tags = signal<TagDto[]>([]);

  ngOnInit(): void {
    this.tagApiService.getTags().subscribe((tags) => {
      this.tags.set(tags);
    });
  }
}
