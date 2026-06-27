import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatSnackBar, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { ApplicationStabService } from '../../services/application-stab/application-stab.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-snack-bar',
  standalone: true,
  imports: [MatSnackBarModule],
  templateUrl: './snack-bar.component.html',
  styleUrl: './snack-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackBarComponent implements OnInit, OnDestroy {
  private readonly snackBar = inject(MatSnackBar);
  private readonly stabService = inject(ApplicationStabService);
  private stabServiceSubscription!: Subscription;
  private snackBarRef: MatSnackBarRef<unknown> | null = null;

  openSnackBar(message: string, action: string): void {
    this.snackBarRef?.dismiss();

    this.snackBarRef = this.snackBar.open(message, action, {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });

    const ref = this.snackBarRef;

    ref.onAction().pipe(take(1)).subscribe(() => ref.dismiss());
    ref.afterDismissed().pipe(take(1)).subscribe(() => {
      if (this.snackBarRef === ref) {
        this.snackBarRef = null;
      }
    });
  }

  ngOnInit(): void {
    this.stabServiceSubscription = this.stabService.stream.subscribe({
      next: ({ message }) => this.openSnackBar(message, 'OK'),
    });
  }

  ngOnDestroy(): void {
    this.snackBarRef?.dismiss();
    this.stabServiceSubscription.unsubscribe();
  }
}
