import { ChangeDetectionStrategy, Component, Type, computed, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { HeaderComponent } from './widgets/header/header.component';
import { FooterComponent } from './widgets/footer/footer.component';
import { AboutMeComponent } from './sections/about-me/about-me.component';
import { MainInfoComponent } from './sections/main-info/main-info.component';
import { TechnologiesComponent } from './sections/technologies/technologies.component';
import { WorkHistoryComponent } from './sections/work-history/work-history.component';
import { NgComponentOutlet } from '@angular/common';
import { TechnologyDrawerComponent } from './widgets/technology-drawer/technology-drawer.component';
import { EducationComponent } from './sections/education/education.component';
import { ScrollUpComponent } from './widgets/scroll-up/scroll-up.component';
import { SnackBarComponent } from './widgets/snack-bar/snack-bar.component';
import {
  SectionNavComponent,
  SectionNavItem,
} from './widgets/section-nav/section-nav.component';
import { SectionWrapperComponent } from './shared/ui-kit/section-wrapper/section-wrapper.component';
import { LanguageService } from './services/language/language.service';
import { TranslocoModule } from '@jsverse/transloco';

interface ISectionMap {
  titleSection: string;
  sectionId: string;
  navLabel?: string;
  isHero?: boolean;
  Component: Type<unknown>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    NgComponentOutlet,
    TechnologyDrawerComponent,
    ScrollUpComponent,
    SnackBarComponent,
    SectionNavComponent,
    SectionWrapperComponent,
    TranslocoModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private transloco = inject(TranslocoService);
  private languageService = inject(LanguageService);

  private readonly lang = this.languageService.currentLang;
  private readonly translationsReady = this.languageService.translationsReady;

  readonly navItems = computed<SectionNavItem[]>(() => {
    this.lang();
    this.translationsReady();
    return [
      { id: 'about', label: this.transloco.translate('nav.about') },
      { id: 'work', label: this.transloco.translate('nav.work') },
      { id: 'technologies', label: this.transloco.translate('nav.technologies') },
      { id: 'education', label: this.transloco.translate('nav.education') },
    ];
  });

  readonly sectionsMap = computed<ISectionMap[]>(() => {
    this.lang();
    this.translationsReady();
    return [
      {
        titleSection: '',
        sectionId: 'hero',
        isHero: true,
        Component: MainInfoComponent,
      },
      {
        titleSection: this.transloco.translate('sections.about'),
        sectionId: 'about',
        navLabel: this.transloco.translate('nav.about'),
        Component: AboutMeComponent,
      },
      {
        titleSection: this.transloco.translate('sections.work'),
        sectionId: 'work',
        navLabel: this.transloco.translate('nav.work'),
        Component: WorkHistoryComponent,
      },
      {
        titleSection: this.transloco.translate('sections.technologies'),
        sectionId: 'technologies',
        navLabel: this.transloco.translate('nav.technologies'),
        Component: TechnologiesComponent,
      },
      {
        titleSection: this.transloco.translate('sections.education'),
        sectionId: 'education',
        navLabel: this.transloco.translate('nav.education'),
        Component: EducationComponent,
      },
    ];
  });

  ngOnInit(): void {
    this.applyMetaTags();
    this.languageService.langChanges$.subscribe(() => this.applyMetaTags());
  }

  private applyMetaTags(): void {
    this.titleService.setTitle(this.transloco.translate('meta.title'));
    this.meta.updateTag({
      name: 'description',
      content: this.transloco.translate('meta.description') ?? '',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: this.transloco.translate('meta.ogTitle') ?? '',
    });
    this.meta.updateTag({
      property: 'og:description',
      content: this.transloco.translate('meta.ogDescription') ?? '',
    });
    this.meta.updateTag({
      name: 'twitter:title',
      content: this.transloco.translate('meta.ogTitle') ?? '',
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content: this.transloco.translate('meta.ogDescription') ?? '',
    });
  }
}
