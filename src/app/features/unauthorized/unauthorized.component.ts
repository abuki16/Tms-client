import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="text-align: center; margin-top: 60px;">
      <h2>403 - Unauthorized</h2>
      <p>You do not have permission to access this page.</p>
      <a routerLink="/login">Return to Login</a>
    </div>
  `
})
export class UnauthorizedComponent {}