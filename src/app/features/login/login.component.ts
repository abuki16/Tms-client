import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
      <h2>TMS Login</h2>
      <form (submit)="onLogin($event)">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Username:</label>
          <input type="text" [(ngModel)]="credentials.email" name="username" required style="width: 100%; padding: 8px;" />
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Password:</label>
          <input type="password" [(ngModel)]="credentials.password" name="password" required style="width: 100%; padding: 8px;" />
        </div>
        <button type="submit" style="width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Login
        </button>
        <p *ngIf="errorMessage" style="color: red; margin-top: 10px;">{{ errorMessage }}</p>
      </form>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = '';

  async onLogin(event: Event) {
    event.preventDefault();
    try {
      await this.authService.login(this.credentials);
      // Redirect to dashboard upon successful login & cookie setting
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.errorMessage = 'Invalid username or password.';
    }
  }
}