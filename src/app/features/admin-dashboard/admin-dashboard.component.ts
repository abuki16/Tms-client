import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EnrollmentStore } from '../../store/enrollment.store';
import { AuthService } from '../../services/auth.service';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
}

export interface UpdateUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
}

@Component({
  selector: 'tms-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  store = inject(EnrollmentStore);
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  
  private authBaseUrl = 'http://localhost:5049/api/v1/auth';

  // Users state management
  users: UserDto[] = [];
  isLoadingUsers = false;
  
  // Edit mode state
  editingUser: UpdateUserDto | null = null;

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.store.loadEnrollments();
    this.loadUsers();
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.http.get<UserDto[]>(`${this.authBaseUrl}/users`).subscribe({
      next: (data) => {
        this.users = data;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
        this.showSnackbar('Failed to load registered users list.', 'error-snackbar');
      }
    });
  }

  onStartEdit(user: UserDto) {
    this.editingUser = { ...user };
  }

  onCancelEdit() {
    this.editingUser = null;
  }

  onUpdateUser() {
    if (!this.editingUser) return;

    this.http.put(`${this.authBaseUrl}/users/${this.editingUser.id}`, this.editingUser).subscribe({
      next: () => {
        this.showSnackbar('User account updated successfully.', 'success-snackbar');
        
        const index = this.users.findIndex(u => u.id === this.editingUser?.id);
        if (index !== -1 && this.editingUser) {
          this.users[index] = { ...this.editingUser };
        }
        
        this.editingUser = null;
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Failed to update user account.';
        this.showSnackbar(errMsg, 'error-snackbar');
      }
    });
  }

  onDeleteUser(userId: string) {
    if (confirm('Are you sure you want to permanently delete this user account?')) {
      this.http.delete(`${this.authBaseUrl}/users/${userId}`).subscribe({
        next: () => {
          this.showSnackbar('User account deleted successfully.', 'success-snackbar');
          this.users = this.users.filter(u => u.id !== userId);
          if (this.editingUser?.id === userId) {
            this.editingUser = null;
          }
        },
        error: (err) => {
          const errMsg = err.error?.message || 'Failed to delete user account.';
          this.showSnackbar(errMsg, 'error-snackbar');
        }
      });
    }
  }

  private showSnackbar(message: string, panelClass: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}