import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        
        <!-- Brand / Header -->
        <div class="login-header">
          <div class="logo-badge">
            <svg class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2>Training Management System</h2>
          <p class="subtitle">Sign in to your professional portal</p>
        </div>

        <!-- Error Banner -->
        @if (errorMessage) {
          <div class="alert error">
            <span>⚠️</span> {{ errorMessage }}
          </div>
        }

        <!-- Form -->
        <form (submit)="onLogin($event)" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-with-icon">
              <span class="icon">✉️</span>
              <input 
                id="email"
                type="email" 
                [(ngModel)]="credentials.email" 
                name="email" 
                required 
                placeholder="name@example.com" 
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-with-icon">
              <span class="icon">🔒</span>
              <input 
                id="password"
                type="password" 
                [(ngModel)]="credentials.password" 
                name="password" 
                required 
                placeholder="••••••••" 
                class="form-control"
              />
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            @if (isLoading) {
              <span class="spinner"></span> Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <!-- Registration Prompt -->
        <div class="signup-prompt">
          <p>Don't have an account? <a routerLink="/register">Sign up</a></p>
        </div>

        <div class="login-footer">
          <p>TMS Core &bull; Secure Portal</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-family: inherit;
      padding: 20px;
    }

    .login-card {
      background: #ffffff;
      width: 100%;
      max-width: 420px;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      .logo-badge {
        width: 56px;
        height: 56px;
        background: #eef2ff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        margin: 0 auto 16px auto;
        border: 1px solid #e0e7ff;
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);

        svg {
          width: 28px;
          height: 28px;
          color: #4f46e5;
        }
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 6px 0;
      }

      .subtitle {
        color: #64748b;
        font-size: 0.9rem;
        margin: 0;
      }
    }

    .alert.error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-form {
      .form-group {
        margin-bottom: 20px;

        label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;

          .icon {
            position: absolute;
            left: 14px;
            font-size: 1rem;
            pointer-events: none;
          }

          .form-control {
            width: 100%;
            padding: 12px 14px 12px 42px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.95rem;
            color: #0f172a;
            background: #f8fafc;
            transition: all 0.2s ease;

            &:focus {
              outline: none;
              border-color: #4f46e5;
              background: #ffffff;
              box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
            }

            &::placeholder {
              color: #94a3b8;
            }
          }
        }
      }
    }

    .btn-submit {
      width: 100%;
      padding: 12px;
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
      margin-top: 10px;

      &:hover {
        background-color: #4338ca;
      }

      &:active {
        transform: scale(0.99);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .signup-prompt {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9rem;

      p {
        color: #475569;
        margin: 0;

        a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;

      p {
        color: #94a3b8;
        font-size: 0.75rem;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  async onLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.isLoading = true;

    try {
      await this.authService.login(this.credentials);
      
      const user = this.authService.currentUser();
      const role = user?.role;

      if (role === 'Admin') {
        this.router.navigate(['/admin-dashboard']);
      } else if (role === 'Instructor') {
        this.router.navigate(['/instructor-dashboard']);
      } else if (role === 'Registrar') {
        this.router.navigate(['/admin/registrar-analytics']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (err) {
      this.errorMessage = 'Invalid email or password. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}