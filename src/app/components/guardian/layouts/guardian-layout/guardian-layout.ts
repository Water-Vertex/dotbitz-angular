import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { GuardianService } from '../../../../services/guardian.service';

@Component({
  selector: 'app-guardian-layout',
  standalone: true, // important for standalone
  imports: [CommonModule, RouterModule], // import modules used in template
  templateUrl: './guardian-layout.html',
  styleUrls: ['./guardian-layout.css'],
})
export class GuardianLayoutComponent implements OnInit {
  guardian: any = {}; // store dynamic data

  // Mobile/desktop toggles
  mobileSidebarActive = false;
  mobileUserDropdownActive = false;
  desktopUserDropdownActive = false;

  constructor(
    private authService: AuthService,
    private guardianService: GuardianService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadGuardianProfile();
  }

  loadGuardianProfile() {
    this.guardianService.getProfile().subscribe({
      next: (res) => {
        this.guardian = res; // store data
        console.log('Guardian profile:', res); // for debugging
      },
      error: (err) => {
        console.error('Failed to load guardian profile', err);
      },
    });
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
}
