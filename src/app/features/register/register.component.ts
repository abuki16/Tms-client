import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'tms-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  newUser: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Student'
  };

  isLoading = false;

  async onRegister(event: Event) {
    event.preventDefault();
    this.isLoading = true;

    try {
      const res: any = await this.authService.register(this.newUser);
      const msg = res?.message || 'Registration successful. Please sign in.';
      
      this.snackBar.open(msg, 'Close', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });

      this.router.navigate(['/login']);
    } catch (err: any) {
      const errorMsg = err.error?.detail || err.error?.message || err.error?.errors?.[0] || 'Registration failed. Please check your inputs.';
      
      this.snackBar.open(errorMsg, 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    } finally {
      this.isLoading = false;
    }
  }
}