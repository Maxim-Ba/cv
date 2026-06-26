import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';
import { AboutMeApiService } from '../../services/api/about-me-api.service';
import { TechnologyWithTagsDto } from '../../api/models/dto/technology-with-tags-dto';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [SectionWrapperComponent, MarginsDirective],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMeComponent implements OnInit {
  private aboutMeApiService = inject(AboutMeApiService);

  public title = 'О себе';
  bioParagraphs = signal<string[]>([]);
  technologies = signal<TechnologyWithTagsDto[]>([]);
  note = signal<string | null>(null);
  hobbies = signal<string | null>(null);

  ngOnInit(): void {
    this.aboutMeApiService.getAboutMe().subscribe((data) => {
      this.bioParagraphs.set(data.bioParagraphs ?? []);
      this.technologies.set(data.technologies ?? []);
      this.note.set(data.note ?? null);
      this.hobbies.set(data.hobbies ?? null);
    });
  }
}
