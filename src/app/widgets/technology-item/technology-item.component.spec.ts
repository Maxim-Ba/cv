import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyItemComponent } from './technology-item.component';

describe('TechnologyItemComponent', () => {
  let component: TechnologyItemComponent;
  let fixture: ComponentFixture<TechnologyItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnologyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
