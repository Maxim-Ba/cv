import { Component, forwardRef } from '@angular/core';
import { FormFieldItemComponent } from '../form-field-item/form-field-item.component';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-form-textarea-item',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormTextareaItemComponent),
      multi: true,
    },
  ],
  templateUrl: './form-textarea-item.component.html',
  styleUrl: './form-textarea-item.component.scss',
})
export class FormTextareaItemComponent extends FormFieldItemComponent {}
