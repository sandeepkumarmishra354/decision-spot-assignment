import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already logged in, redirect to /users
  if (authService.isLoggedIn()) {
    router.navigate(['/users']);
    return false;
  }

  return true;
};
