import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface TmsUser {
  id?: string;
  studentId?: number;
  email: string;
  displayName: string;
  role: string | string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id?: string;
    studentId?: number;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Initialize token from sessionStorage so closing tab/browser clears session and requires re-login
  private accessToken = signal<string | null>(this.getSessionToken());
  currentUser = signal<TmsUser | null>(this.decodeUserFromToken(this.getSessionToken()));

  private getSessionToken(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem('accessToken');
    }
    return null;
  }

  getAccessToken(): string | null {
    return this.accessToken() || this.getSessionToken();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken() && !!this.currentUser();
  }

  hasRole(requiredRole: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Admins bypass all role checks
    if (user.role === 'Admin' || (Array.isArray(user.role) && user.role.includes('Admin'))) {
      return true;
    }

    // Check if user has the specific required role
    if (Array.isArray(user.role)) {
      return user.role.includes(requiredRole);
    }
   
    return user.role === requiredRole;
  }

  async login(credentials: LoginRequest): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/v1/auth/login', credentials)
    );
   
    this.saveToken(res.accessToken, res.user);
  }

  async register(data: RegisterRequest): Promise<any> {
    return await firstValueFrom(
      this.http.post<any>('/api/v1/auth/register', data)
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    this.accessToken.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private saveToken(token: string, userPayload?: AuthResponse['user']) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('accessToken', token);
    }

    // Clean up persistent localStorage to avoid lingering cross-session tokens
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    this.accessToken.set(token);

    const decoded = this.decodeUserFromToken(token);
    if (userPayload && decoded) {
      if (userPayload.studentId && !decoded.studentId) {
        decoded.studentId = userPayload.studentId;
      }
      if (userPayload.displayName) {
        decoded.displayName = userPayload.displayName;
      }
    }
    this.currentUser.set(decoded);
  }

  private decodeUserFromToken(token: string | null): TmsUser | null {
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roleClaim =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload.role ||
        'Student';

      const studentIdClaim =
        payload.studentId ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'] ||
        payload.sid;

      const nameClaim =
        payload.displayName ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        payload.name ||
        payload.FirstName;

      return {
        id: payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        studentId: studentIdClaim ? Number(studentIdClaim) : undefined,
        email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.sub,
        displayName: nameClaim || payload.email || 'User',
        role: roleClaim
      };
    } catch (e) {
      console.error('Failed to parse JWT token', e);
      return null;
    }
  }
}