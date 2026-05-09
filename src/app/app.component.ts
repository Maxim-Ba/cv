import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  Renderer2,
  Type,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { HeaderComponent } from './widgets/header/header.component';
import { FooterComponent } from './widgets/footer/footer.component';
import { AboutMeComponent } from './sections/about-me/about-me.component';
import { MainInfoComponent } from './sections/main-info/main-info.component';
import { TechnologiesComponent } from './sections/technologies/technologies.component';
import { WorkHistoryComponent } from './sections/work-history/work-history.component';
import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { TechnologyDrawerComponent } from './widgets/technology-drawer/technology-drawer.component';
import { EducationComponent } from './sections/education/education.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MarginsDirective } from './shared/directive/margins/margins.directive';
import { ScrollUpComponent } from './widgets/scroll-up/scroll-up.component';
import { SnackBarComponent } from './widgets/snack-bar/snack-bar.component';

interface ISectionMap {
  titleSection: string;
  Component: Type<any>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    AboutMeComponent,
    MainInfoComponent,
    TechnologiesComponent,
    WorkHistoryComponent,
    TechnologyDrawerComponent,
    EducationComponent,
    MatExpansionModule,
    NgComponentOutlet,
    MarginsDirective,
    ScrollUpComponent,
    SnackBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private meta: Meta,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Балашов Максим — Full-Stack разработчик');
    this.meta.addTags([
      { name: 'description', content: 'Портфолио Full-Stack разработчика Балашова Максима: Go, Angular, PostgreSQL, Docker, SSR.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Балашов Максим — Full-Stack разработчик' },
      { property: 'og:description', content: 'Опыт разработки: Go REST API, Angular 17 SSR, PostgreSQL, Docker, CI/CD.' },
      { property: 'og:url', content: 'https://cv.maxim-balashov.ru/' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Балашов Максим — Full-Stack разработчик' },
      { name: 'twitter:description', content: 'Опыт разработки: Go REST API, Angular 17 SSR, PostgreSQL, Docker, CI/CD.' },
    ]);
  }
  title = 'Балашов Максим Frontend';
  sectionsMap: ISectionMap[] = [
    {
      titleSection: '',
      Component: MainInfoComponent,
    },
    {
      titleSection: 'О себе',
      Component: AboutMeComponent,
    },
    {
      titleSection: 'Места работы',
      Component: WorkHistoryComponent,
    },
    {
      titleSection: 'Используемые технологии',
      Component: TechnologiesComponent,
    },
    {
      titleSection: 'Образование',
      Component: EducationComponent,
    },
  ];
  createComponent(index: number) {
    return this.sectionsMap[index].Component;
  }
  switchMode(isDarkMode: boolean) {
    const hostClass = isDarkMode ? 'theme-dark' : '';
    this.renderer.setAttribute(this.document.body, 'class', hostClass);
  }
}
