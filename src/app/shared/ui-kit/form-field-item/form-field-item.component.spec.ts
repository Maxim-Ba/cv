import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldItemComponent } from './form-field-item.component';

describe('FormFieldItemComponent', () => {
  let component: FormFieldItemComponent;
  let fixture: ComponentFixture<FormFieldItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormFieldItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
