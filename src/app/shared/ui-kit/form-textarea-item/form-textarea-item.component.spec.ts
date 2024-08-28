import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTextareaItemComponent } from './form-textarea-item.component';

describe('FormTextareaItemComponent', () => {
  let component: FormTextareaItemComponent;
  let fixture: ComponentFixture<FormTextareaItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTextareaItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormTextareaItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
