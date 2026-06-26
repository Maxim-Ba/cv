import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AboutMeComponent } from './about-me.component';
import { AboutMeApiService } from '../../services/api/about-me-api.service';

describe('AboutMeComponent', () => {
  let component: AboutMeComponent;
  let fixture: ComponentFixture<AboutMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMeComponent],
      providers: [
        {
          provide: AboutMeApiService,
          useValue: {
            getAboutMe: () =>
              of({
                bioParagraphs: ['Test bio'],
                technologies: [{ id: 1, title: 'TypeScript', tags: [] }],
                note: 'Test note',
                hobbies: 'Test hobbies',
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
