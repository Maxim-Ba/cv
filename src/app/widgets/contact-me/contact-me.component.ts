import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ApplicationStabService } from '../../services/application-stab/application-stab.service';
import { NotifyMaximService } from '../../services/notify-maxim/notify-maxim.service';
import { FormFieldItemComponent } from '../../shared/ui-kit/form-field-item/form-field-item.component';
import { FormTextareaItemComponent } from '../../shared/ui-kit/form-textarea-item/form-textarea-item.component';

@Component({
  selector: 'app-contact-me',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    ReactiveFormsModule,
    FormFieldItemComponent,
    FormTextareaItemComponent,
  ],
  templateUrl: './contact-me.component.html',
  styleUrl: './contact-me.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactMeComponent {
  public title = 'Связаться со мной';
  private dialogRef?: MatDialogRef<any> = undefined;
  readonly dialog = inject(MatDialog);

  @ViewChild('modal') modal = {} as TemplateRef<string>;
  public stabService = inject(ApplicationStabService);
  private notifyService = inject(NotifyMaximService);

  readonly isSending = signal(false);

  feedbackForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
  });
  get emailHint() {
    const email = this.feedbackForm.get('email');

    const errors = email?.errors;
    if (!this.feedbackForm.controls.email.touched) {
      return '';
    }
    // TODO отрефакторить на paternMatching
    if (errors?.['email']) {
      return 'Не валидный email';
    }
    if (errors?.['required']) {
      return 'Обязательное поле';
    }
    return '';
  }
  get messageHint() {
    const errors = this.feedbackForm.get('message')?.errors;
    if (!this.feedbackForm.controls.message.touched) {
      return '';
    }
    if (errors?.['required']) {
      return 'Обязательное поле';
    }
    return '';
  }
  get nameHint() {
    const errors = this.feedbackForm.get('name')?.errors;
    if (!this.feedbackForm.controls.name.touched) {
      return '';
    }
    if (errors?.['required']) {
      return 'Обязательное поле';
    }

    return '';
  }
  openDialog() {
    this.dialogRef = this.dialog.open(this.modal, { data: 'dialog data' });
  }
  closeDialog() {
    this.dialogRef?.close();
  }
  send() {
    if (!this.feedbackForm.valid || this.isSending()) return;
    this.isSending.set(true);
    const { name, email, message } = this.feedbackForm.value as { name: string; email: string; message: string };
    this.notifyService.send({ name, email, message }).subscribe({
      next: () => {
        this.stabService.notify('Сообщение отправлено!');
        this.feedbackForm.reset();
        this.closeDialog();
      },
      error: () => {
        this.stabService.notify('Ошибка отправки. Попробуйте позже.');
      },
      complete: () => this.isSending.set(false),
    });
  }
}
