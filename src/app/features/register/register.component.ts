import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'tms-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
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

    if (!this.newUser.firstName?.trim() || !this.newUser.lastName?.trim()) {
      this.toast.warning('Please provide both First Name and Last Name.');
      return;
    }

    this.isLoading = true;

    try {
      const res: any = await this.authService.register(this.newUser);
      const msg = res?.message || 'Registration successful. Please sign in.';
      this.toast.success(msg);
      this.router.navigate(['/login']);
    } catch (err: any) {
      const errorMsg = err.error?.detail || 
                       err.error?.message || 
                       err.error?.errors?.[0] || 
                       'Registration failed. Please check your inputs.';
      this.toast.error(errorMsg);
    } finally {
      this.isLoading = false;
    }
  }
}