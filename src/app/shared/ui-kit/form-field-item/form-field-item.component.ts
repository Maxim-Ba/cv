import { NgIf } from '@angular/common';
import { Component, forwardRef, inject, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ViewEncapsulation } from '@angular/core';
import { MyErrorStateMatcher } from '../../../services/error-state-matcher.service';

@Component({
  selector: 'app-form-field-item',
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
      useExisting: forwardRef(() => FormFieldItemComponent),
      multi: true,
    },
  ],
  templateUrl: './form-field-item.component.html',
  styleUrl: './form-field-item.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldItemComponent implements ControlValueAccessor, OnInit {
  ngOnInit(): void {
    this.inputControl.valueChanges.subscribe((v) => {
      this.onChange(v);
    });
    this.inputControl.setValidators(this.validator);
  }

  onChange: (param: unknown) => void = () => {};
  onTouch: (param: unknown) => void = () => {};
  @Input({ required: true })
  validator: ValidatorFn | null = null;
  @Input()
  isDisabled: boolean = false;

  writeValue(value: string): void {
    this.inputControl.setValue(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
  // #endregion
  @Input({ required: true }) formControlName!: string;
  @Input() label: string = '';
  @Input({ required: true }) name!: string;
  @Input() hint: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';

  inputControl = new FormControl();
  matcher = new MyErrorStateMatcher();
}
