 import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';

import { firstValueFrom } from 'rxjs';



export interface TmsUser {

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

}



@Injectable({

  providedIn: 'root'

})

export class AuthService {

  private http = inject(HttpClient);

  private router = inject(Router);



  // Initialize token from localStorage to persist sessions on page refresh

  private accessToken = signal<string | null>(localStorage.getItem('accessToken'));

  currentUser = signal<TmsUser | null>(this.decodeUserFromToken(localStorage.getItem('accessToken')));



  getAccessToken(): string | null {

    return this.accessToken();

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

   

    this.saveToken(res.accessToken);

  }



  async register(data: RegisterRequest): Promise<any> {

    return await firstValueFrom(

      this.http.post<any>('/api/v1/auth/register', data)

    );

  }



  logout(): void {

    localStorage.removeItem('accessToken');

    localStorage.removeItem('refreshToken');

    this.accessToken.set(null);

    this.currentUser.set(null);

    this.router.navigate(['/login']);

  }



  private saveToken(token: string) {

    localStorage.setItem('accessToken', token);

    this.accessToken.set(token);

    this.currentUser.set(this.decodeUserFromToken(token));

  }



  private decodeUserFromToken(token: string | null): TmsUser | null {

    if (!token) return null;

    try {

      const payload = JSON.parse(atob(token.split('.')[1]));

      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'Student';



      return {

        email: payload.email || payload.sub,

        displayName: payload.name || payload.email || 'User',

        role: roleClaim

      };

    } catch (e) {

      console.error('Failed to parse JWT token', e);

      return null;

    }

  }

}