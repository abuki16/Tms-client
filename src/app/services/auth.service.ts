import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TmsUser {
  displayName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5049/api'; // <--- Points directly to /api
  currentUser = signal<TmsUser | null>(null);

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role || user?.role === 'Admin';
  }

  async login(credentials: LoginRequest): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/auth/login`, credentials, { 
        withCredentials: true 
      })
    );

    const user = await firstValueFrom(
      this.http.get<TmsUser>(`${this.baseUrl}/auth/me`, { 
        withCredentials: true 
      })
    );

    this.currentUser.set(user);
  }
}