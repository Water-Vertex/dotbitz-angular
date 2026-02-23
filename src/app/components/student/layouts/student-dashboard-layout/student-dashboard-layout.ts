import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-student-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard-layout.html',
})
export class StudentDashboardLayout {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/student/login']);
    });
  }

navigateToProfile() {
    this.router.navigate(['/student/profile']);
  }
  navigateToLogout() {
    this.router.navigate(['/student/logout']);
  }

}