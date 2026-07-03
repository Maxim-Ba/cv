import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { TagComponent } from '../tag/tag.component';
import { TagDto } from '../../../../api/models/dto/tag-dto';
import { MatChipsModule } from '@angular/material/chips';
import { TagApiService } from '../../../../services/api/tag-api.service';
import { bindLanguageReload } from '../../../../services/language/language-reload.util';

@Component({
  selector: 'app-tag-filter',
  standalone: true,
  imports: [TagComponent, MatChipsModule, TranslocoModule],
  templateUrl: './tag-filter.component.html',
  styleUrl: './tag-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFilterComponent {
  private tagApiService = inject(TagApiService);
  tags = signal<TagDto[]>([]);

  constructor() {
    bindLanguageReload(() => this.loadTags());
  }

  private loadTags(): void {
    this.tagApiService.getTags().subscribe((tags) => {
      this.tags.set(tags);
    });
  }
}
