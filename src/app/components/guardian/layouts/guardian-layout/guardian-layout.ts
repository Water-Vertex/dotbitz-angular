import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { GuardianService } from '../../../../services/guardian.service';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-guardian-layout',
  standalone: true, // important for standalone
  imports: [CommonModule, RouterModule], // import modules used in template
  templateUrl: './guardian-layout.html',
  styleUrls: ['./guardian-layout.css'],
})
export class GuardianLayout implements OnInit {
  guardian: any = {}; // store dynamic data
currentUser: User | null = null;
    userInitials: string = '';
  // Mobile/desktop toggles
  mobileSidebarActive = false;
  mobileUserDropdownActive = false;
  desktopUserDropdownActive = false;

  constructor(
    private authService: AuthService,
    private guardianService: GuardianService,
    private router: Router,
  ) {}

 
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
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['guardian/login']),
      error: () => this.router.navigate(['guardian/login']),
    });
  }

  toggleMobileSidebar() {
    this.mobileSidebarActive = !this.mobileSidebarActive;
  }

  toggleMobileUserDropdown() {
    this.mobileUserDropdownActive = !this.mobileUserDropdownActive;
  }

  navigateToProfile() {
    this.router.navigate(['/guardian/profile']);
  }
  navigateToLogout() {
    this.router.navigate(['/guardian/logout']);
  }

   // Helper method to get full name
  getFullName(): string {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return 'Guardian';
  }
  getUsername(): string {
    if (this.currentUser?.first_name) {
      return `${this.currentUser.first_name}`;
    }
    return 'Guardian';
  }

  // Helper method to get email
  getEmail(): string {
    return this.currentUser?.email || 'guardian@example.com';
  }
}
