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
currentUser = signal<TmsUser | null>(null);
hasRole(role: string): boolean {
const user = this.currentUser();
return user?.role === role || user?.role === 'Admin';
}
async login(credentials: LoginRequest) {
// Server sets the HttpOnly cookie in the Set-Cookie responseheader
await firstValueFrom(
this.http.post<void>('/api/auth/login', credentials)
);
// Fetch authenticated profile — browser automatically sendsthe cookie
const user = await firstValueFrom(
this.http.get<TmsUser>('/api/auth/me')
);
this.currentUser.set(user);
}
}















// import { Injectable, inject, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { firstValueFrom } from 'rxjs';

// export interface TmsUser {
//   displayName: string;
//   role: string;
// }

// export interface LoginRequest {
//   username: string;
//   password: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private http = inject(HttpClient);
//   private baseUrl = 'http://localhost:5049/api'; // <--- Points directly to /api
//   currentUser = signal<TmsUser | null>(null);

//   hasRole(role: string): boolean {
//     const user = this.currentUser();
//     return user?.role === role || user?.role === 'Admin';
//   }

//   async login(credentials: LoginRequest): Promise<void> {
//     await firstValueFrom(
//       this.http.post<void>(`${this.baseUrl}/auth/login`, credentials, { 
//         withCredentials: true 
//       })
//     );

//     const user = await firstValueFrom(
//       this.http.get<TmsUser>(`${this.baseUrl}/auth/me`, { 
//         withCredentials: true 
//       })
//     );

//     this.currentUser.set(user);
//   }
// }