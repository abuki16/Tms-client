import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    horizontalPosition: 'right',
    verticalPosition: 'top',
    duration: 3500
  };

  /**
   * Displays a success notification toast with a checkmark badge.
   */
  success(message: string, action = '✕', duration = 3500): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration,
      panelClass: ['tms-toast', 'toast-success']
    });
  }

  /**
   * Displays an error notification toast with an alert badge.
   */
  error(message: string, action = '✕', duration = 4500): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration,
      panelClass: ['tms-toast', 'toast-error']
    });
  }

  /**
   * Displays a warning notification toast with a warning badge.
   */
  warning(message: string, action = '✕', duration = 4000): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration,
      panelClass: ['tms-toast', 'toast-warning']
    });
  }

  /**
   * Displays an informational notification toast.
   */
  info(message: string, action = '✕', duration = 3500): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration,
      panelClass: ['tms-toast', 'toast-info']
    });
  }
}
