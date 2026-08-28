import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5049/api/v1/auth';

  // Form model matching C# RegisterRequest record completely
  newUser: RegisterRequestDto = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Student'
  };

  successMessage = '';
  errorMessage = '';

  onRegisterUser() {
    this.http.post(`${this.baseUrl}/register`, this.newUser).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || `User account registered successfully!`;
        this.errorMessage = '';
        this.newUser = { email: '', password: '', firstName: '', lastName: '', role: 'Student' };
      },
      error: (err) => {
        const errors = err.error?.errors;
        if (errors && Array.isArray(errors)) {
          this.errorMessage = errors.join(' | ');
        } else {
          this.errorMessage = err.error?.detail || 'Failed to register user. Please check password complexity requirements.';
        }
        this.successMessage = '';
      }
    });
  }
}