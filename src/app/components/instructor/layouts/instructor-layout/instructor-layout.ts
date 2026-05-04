import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-instructor-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './instructor-layout.html',
})
export class InstructorLayout implements OnInit {
  currentUser: User | null = null;
  userInitials: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setUserInitials();
    });

    // If you need to force load from storage (in case the subscription doesn't fire immediately)
    if (!this.currentUser) {
      this.currentUser = this.authService.getCurrentUser();
      this.setUserInitials();
    }
  }

  setUserInitials() {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      const name = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      this.userInitials = name.charAt(0).toUpperCase();
    } else if (this.currentUser?.email) {
      this.userInitials = this.currentUser.email.charAt(0).toUpperCase();
    } else {
      this.userInitials = 'A'; // Default fallback
    }
  }

  logout() {
    this.authService.Instructorlogout().subscribe({
      next: () => {
        // Navigation is handled in the service
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }

  navigateToProfile() {
    this.router.navigate(['/instructor/profile']);
  }

  navigateToLogout() {
    this.logout();
  }

  // Helper method to get full name
  getFullName(): string {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return 'Instructor';
  }
  getUsername(): string {
    if (this.currentUser?.first_name) {
      return `${this.currentUser.first_name}`;
    }
    return 'Instructor';
  }

  // Helper method to get email
  getEmail(): string {
    return this.currentUser?.email || 'instructor@example.com';
  }

  navigateToPasswordReset(): void {
  // Iska path wahi hona chahiye jo aapne routing file mein rakha hai
  this.router.navigate(['/instructor/password-reset']);

}
}
