import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  role?: string;
  roles?: string[];
  assignedCourseId?: number | null;
  assignedCourseTitle?: string | null;
}

export interface UpdateUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  assignedCourseId?: number | null;
}

@Component({
  selector: 'tms-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);
  
  private authBaseUrl = '/api/v1/auth';

  users: UserDto[] = [];
  courses: any[] = [];
  isLoadingUsers = false;
  
  // Edit mode state
  editingUser: UpdateUserDto | null = null;

  newUser: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Student',
    assignedCourseId: null
  };

  ngOnInit() {
    this.loadUsers();
    this.loadCourses();
  }

  loadCourses() {
    this.http.get<any>('/api/courses?pageSize=100').subscribe({
      next: (res) => {
        this.courses = res?.items ? res.items : (Array.isArray(res) ? res : []);
      },
      error: (err) => console.warn('Failed to load courses for user assignment', err)
    });
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

  onAssignCourse(courseIdVal: any, instructorId: string) {
    const courseId = Number(courseIdVal);
    if (!courseId) return;

    this.http.post(`/api/courses/${courseId}/assign-instructor`, { instructorId }).subscribe({
      next: () => {
        this.showSnackbar('Course successfully assigned to instructor.', 'success-snackbar');
        this.loadUsers();
        this.loadCourses();
      },
      error: () => {
        this.showSnackbar('Failed to assign instructor to course.', 'error-snackbar');
      }
    });
  }

  onRegisterUser() {
    // Professional validation check for missing fields
    if (
      !this.newUser.email?.trim() || 
      !this.newUser.password?.trim() || 
      !this.newUser.firstName?.trim() || 
      !this.newUser.lastName?.trim()
    ) {
      this.showSnackbar('Please complete all required fields before proceeding.', 'error-snackbar');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email.trim())) {
      this.showSnackbar('Please provide a valid email address.', 'error-snackbar');
      return;
    }

    this.http.post(`${this.authBaseUrl}/register`, this.newUser).subscribe({
      next: () => {
        this.showSnackbar('User account created successfully.', 'success-snackbar');
        this.newUser = {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'Student',
          assignedCourseId: null
        };
        this.loadUsers();
        this.loadCourses();
      },
      error: (err) => {
        const errMsg = err.error?.message || err.error?.errors?.[0] || 'Failed to create user account.';
        this.showSnackbar(errMsg, 'error-snackbar');
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

    if (
      !this.editingUser.email?.trim() || 
      !this.editingUser.firstName?.trim() || 
      !this.editingUser.lastName?.trim() || 
      !this.editingUser.userName?.trim()
    ) {
      this.showSnackbar('Please complete all required fields before saving changes.', 'error-snackbar');
      return;
    }

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
        error: () => {
          this.showSnackbar('Failed to delete user account.', 'error-snackbar');
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