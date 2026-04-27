// logout.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guardian-logout',
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Logging out...</p>
      </div>
    </div>
  `,
  standalone: true
})
export class GuardianLogout {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.logout();
  }

  logout(): void {
    this.authService.GuardianLogout().subscribe({
      next: () => {
        // Already handled in AuthService
      },
      error: () => {
        // Force redirect even if there's an error
        this.router.navigate(['/guardian/login']);
      }
    });
  }
}
