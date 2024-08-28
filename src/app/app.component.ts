import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Renderer2,
  Type,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './widgets/header/header.component';
import { FooterComponent } from './widgets/footer/footer.component';
import { AboutMeComponent } from './sections/about-me/about-me.component';
import { MainInfoComponent } from './sections/main-info/main-info.component';
import { TechnologiesComponent } from './sections/technologies/technologies.component';
import { WorkHistoryComponent } from './sections/work-history/work-history.component';
import { HttpClientModule } from '@angular/common/http';
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
    HttpClientModule,
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
  providers: [HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {}
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
