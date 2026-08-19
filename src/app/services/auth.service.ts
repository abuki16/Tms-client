import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TmsUser {
  displayName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<TmsUser | null>(null);

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role || user?.role === 'Admin';
  }

  async login(credentials: LoginRequest) {
    // Server sets the HttpOnly cookie in the Set-Cookie response header
    await firstValueFrom(
      this.http.post<void>('/api/v1/auth/login', credentials) // <--- Ensure v1 is included here
    );
    
    // Fetch authenticated profile — browser automatically sends the cookie
    const user = await firstValueFrom(
      this.http.get<TmsUser>('/api/v1/auth/me') // <--- Ensure v1 is included here
    );
    
    this.currentUser.set(user);
  }
}

