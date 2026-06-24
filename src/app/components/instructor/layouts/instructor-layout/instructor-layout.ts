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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setUserInitials();
    });

    if (!this.currentUser) {
      this.currentUser = this.authService.getCurrentUser();
      this.setUserInitials();
    }

    setTimeout(() => {
      this.initMobileUserMenu();
    }, 0);
  }

  initMobileUserMenu() {
    const mobileUserBtn = document.getElementById('mobileUserBtn');
    const mobileUserDropdown = document.getElementById('mobileUserDropdown');

    mobileUserBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = mobileUserDropdown?.classList.contains('active');
      if (isActive) {
        mobileUserDropdown?.classList.remove('active');
      } else {
        mobileUserDropdown?.classList.add('active');
        // mobileOverlay ko bilkul mat chheyna
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        !mobileUserBtn?.contains(target) &&
        !mobileUserDropdown?.contains(target)
      ) {
        mobileUserDropdown?.classList.remove('active');
      }
    });
  }

  setUserInitials() {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      const name = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      this.userInitials = name.charAt(0).toUpperCase();
    } else if (this.currentUser?.email) {
      this.userInitials = this.currentUser.email.charAt(0).toUpperCase();
    } else {
      this.userInitials = 'A';
    }
  }

  logout() {
    this.authService.Instructorlogout().subscribe({
      next: () => {
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

  getEmail(): string {
    return this.currentUser?.email || 'instructor@example.com';
  }

  navigateToPasswordReset(): void {
    this.router.navigate(['/instructor/password-reset']);
  }
}