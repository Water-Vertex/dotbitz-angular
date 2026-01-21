import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Wait for auth service to initialize
  const isLoggedIn = await authService.waitForInitialization();
  
  if (isLoggedIn) {
    return true; // Allow access
  } else {
    // Redirect to login page
    router.navigate(['/login']);
    return false;
  }
};