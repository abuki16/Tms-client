import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (...allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // If user is not authenticated, redirect to login page immediately
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    // Check if the user has any of the allowed roles
    const hasAccess = allowedRoles.some(role => auth.hasRole(role));

    if (hasAccess) {
      return true;
    }

    return router.createUrlTree(['/unauthorized']);
  };
};