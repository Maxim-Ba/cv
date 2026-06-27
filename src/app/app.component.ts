import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Type,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(
    private meta: Meta,
    private titleService: Title
  ) {}

  readonly navItems: SectionNavItem[] = [
    { id: 'about', label: 'О себе' },
    { id: 'work', label: 'Опыт' },
    { id: 'technologies', label: 'Стек' },
    { id: 'education', label: 'Образование' },
  ];

  readonly sectionsMap: ISectionMap[] = [
    {
      titleSection: '',
      sectionId: 'hero',
      isHero: true,
      Component: MainInfoComponent,
    },
    {
      titleSection: 'О себе',
      sectionId: 'about',
      navLabel: 'О себе',
      Component: AboutMeComponent,
    },
    {
      titleSection: 'Места работы',
      sectionId: 'work',
      navLabel: 'Опыт',
      Component: WorkHistoryComponent,
    },
    {
      titleSection: 'Используемые технологии',
      sectionId: 'technologies',
      navLabel: 'Стек',
      Component: TechnologiesComponent,
    },
    {
      titleSection: 'Образование',
      sectionId: 'education',
      navLabel: 'Образование',
      Component: EducationComponent,
    },
  ];

  ngOnInit(): void {
    this.titleService.setTitle('Балашов Максим — Full-Stack разработчик');
    this.meta.addTags([
      {
        name: 'description',
        content:
          'Портфолио Full-Stack разработчика Балашова Максима: Go, Angular, PostgreSQL, Docker, SSR.',
      },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:title',
        content: 'Балашов Максим — Full-Stack разработчик',
      },
      {
        property: 'og:description',
        content:
          'Опыт разработки: Go REST API, Angular 17 SSR, PostgreSQL, Docker, CI/CD.',
      },
      { property: 'og:url', content: 'https://cv.maxim-balashov.ru/' },
      { name: 'twitter:card', content: 'summary' },
      {
        name: 'twitter:title',
        content: 'Балашов Максим — Full-Stack разработчик',
      },
      {
        name: 'twitter:description',
        content:
          'Опыт разработки: Go REST API, Angular 17 SSR, PostgreSQL, Docker, CI/CD.',
      },
    ]);
  }
}
