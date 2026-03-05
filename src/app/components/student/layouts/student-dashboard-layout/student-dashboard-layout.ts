import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-student-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard-layout.html',
})
export class StudentDashboardLayout {
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
    this.authService.Studentlogout().subscribe(() => {
      this.router.navigate(['/student/login']);
    });
  }

navigateToProfile() {
    this.router.navigate(['/student/profile']);
  }
  navigateToLogout() {
    this.router.navigate(['/student/logout']);
  }

   // Helper method to get full name
  getFullName(): string {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return 'Student';
  }
  getUsername(): string {
    if (this.currentUser?.first_name) {
      return `${this.currentUser.first_name}`;
    }
    return 'Student';
  }

  // Helper method to get email
  getEmail(): string {
    return this.currentUser?.email || 'student@example.com';
  }

}