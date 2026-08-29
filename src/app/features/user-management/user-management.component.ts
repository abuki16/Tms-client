import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string; // 'Admin' | 'Instructor' | 'Student'
}

@Component({
  selector: 'tms-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private baseUrl = 'http://localhost:5049/api/v1/auth';

  // Form model matching C# RegisterRequest record completely
  newUser: RegisterRequestDto = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Student'
  };

  onRegisterUser() {
    this.http.post(`${this.baseUrl}/register`, this.newUser).subscribe({
      next: (res: any) => {
        const msg = res.message || `User account registered successfully!`;
        
        // Show success notification snackbar
        this.snackBar.open(msg, 'Close', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        // Reset form
        this.newUser = { email: '', password: '', firstName: '', lastName: '', role: 'Student' };
      },
      error: (err) => {
        let errorMsg = 'Failed to register user. Please check password complexity requirements.';
        const errors = err.error?.errors;
        
        if (errors && Array.isArray(errors)) {
          errorMsg = errors.join(' | ');
        } else if (err.error?.detail) {
          errorMsg = err.error.detail;
        }

        // Show error notification snackbar
        this.snackBar.open(errorMsg, 'Dismiss', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}