import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyDrawerComponent } from './technology-drawer.component';

describe('TechnologyDrawerComponent', () => {
  let component: TechnologyDrawerComponent;
  let fixture: ComponentFixture<TechnologyDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyDrawerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnologyDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
