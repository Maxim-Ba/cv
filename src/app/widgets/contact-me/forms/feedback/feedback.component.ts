import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class FeedbackComponent {
  form = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    message: new FormControl(null, Validators.required),
    phone: new FormControl(null),
    attachmentFile: new FormControl(null),
  });
  onSubmit = (_e: SubmitEvent) => {
    if (this.form.valid) {
      // TODO: реализовать отправку формы
    }
  };
}
