import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationStabService } from '../../services/application-stab/application-stab.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-snack-bar',
  standalone: true,
  imports: [],
  templateUrl: './snack-bar.component.html',
  styleUrl: './snack-bar.component.scss',
})
export class SnackBarComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private stabService = inject(ApplicationStabService);
  private stabServiceSubscription!: Subscription;
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action);
  }
  ngOnInit(): void {
    this.stabServiceSubscription = this.stabService.stream.subscribe({
      next: ({ message }) => this.openSnackBar(message, 'Ok'),
    });
  }
  ngOnDestroy(): void {
    this.stabServiceSubscription.unsubscribe();
  }
}
